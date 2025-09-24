import { GmailClient } from './gmail'

export interface ParsedEmail {
  thread: {
    id: string
    subject: string
    snippet: string
    history_id: number
    gmail_thread_id: string
  }
  message: {
    id: string
    gmail_id: string
    gmail_message_id: string
    from_email: string
    from_name: string
    to_emails: string[]
    cc_emails: string[]
    bcc_emails: string[]
    subject: string
    body: string
    body_html: string
    is_read: boolean
    is_starred: boolean
    is_important: boolean
    is_sent: boolean
    sent_at: string | null
    received_at: string
  }
  labels: string[]
  attachments: Array<{
    filename: string
    mime_type: string
    size: number
    gmail_attachment_id: string
  }>
}

export class EmailParser {
  private gmailClient: GmailClient

  constructor(gmailClient: GmailClient) {
    this.gmailClient = gmailClient
  }

  async parseMessage(gmailMessageId: string): Promise<ParsedEmail | null> {
    try {
      const messageResponse = await this.gmailClient.getMessage({ id: gmailMessageId })
      const message = messageResponse.data

      if (!message.payload) {
        return null
      }

      // Extract headers
      const headers = message.payload.headers || []
      const getHeader = (name: string) => 
        headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || ''

      // Parse email addresses
      const fromHeader = getHeader('From')
      const toHeader = getHeader('To')
      const ccHeader = getHeader('Cc')
      const bccHeader = getHeader('Bcc')

      const fromEmail = this.extractEmail(fromHeader)
      const fromName = this.extractName(fromHeader)
      const toEmails = this.parseEmailList(toHeader)
      const ccEmails = this.parseEmailList(ccHeader)
      const bccEmails = this.parseEmailList(bccHeader)

      // Determine if this is a sent message
      const isSent = message.labelIds?.includes('SENT') || false

      // Extract body content
      const { body, bodyHtml } = this.extractBody(message.payload)

      // Parse date
      const dateHeader = getHeader('Date')
      const sentAt = dateHeader ? new Date(dateHeader).toISOString() : null

      // Extract attachments
      const attachments = this.extractAttachments(message.payload)

      // Get thread info
      const threadResponse = await this.gmailClient.getThread({ id: message.threadId! })
      const thread = threadResponse.data

      return {
        thread: {
          id: '', // Will be set by the sync function
          subject: getHeader('Subject'),
          snippet: message.snippet || '',
          history_id: parseInt(thread.historyId || '0'),
          gmail_thread_id: message.threadId!
        },
        message: {
          id: '', // Will be set by the sync function
          gmail_id: message.id!,
          gmail_message_id: message.id!,
          from_email: fromEmail,
          from_name: fromName,
          to_emails: toEmails,
          cc_emails: ccEmails,
          bcc_emails: bccEmails,
          subject: getHeader('Subject'),
          body: body,
          body_html: bodyHtml,
          is_read: !message.labelIds?.includes('UNREAD'),
          is_starred: message.labelIds?.includes('STARRED') || false,
          is_important: message.labelIds?.includes('IMPORTANT') || false,
          is_sent: isSent,
          sent_at: sentAt,
          received_at: new Date().toISOString()
        },
        labels: message.labelIds || [],
        attachments: attachments
      }
    } catch (error) {
      throw new Error(`Failed to parse message ${gmailMessageId}: ${error}`)
    }
  }

  private extractEmail(emailString: string): string {
    const match = emailString.match(/<(.+)>/)
    return match ? match[1] : emailString.trim()
  }

  private extractName(emailString: string): string {
    const match = emailString.match(/^(.+)\s*<.+>$/)
    return match ? match[1].trim().replace(/['"]/g, '') : ''
  }

  private parseEmailList(emailString: string): string[] {
    if (!emailString) return []
    
    return emailString
      .split(',')
      .map(email => this.extractEmail(email.trim()))
      .filter(email => email.length > 0)
  }

  private extractBody(payload: any): { body: string; bodyHtml: string } {
    let body = ''
    let bodyHtml = ''

    if (payload.body?.data) {
      // Single part message
      const content = Buffer.from(payload.body.data, 'base64').toString()
      if (payload.mimeType === 'text/html') {
        bodyHtml = content
      } else {
        body = content
      }
    } else if (payload.parts) {
      // Multi-part message
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString()
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          bodyHtml = Buffer.from(part.body.data, 'base64').toString()
        } else if (part.parts) {
          // Nested parts
          const nested = this.extractBody(part)
          if (nested.body) body = nested.body
          if (nested.bodyHtml) bodyHtml = nested.bodyHtml
        }
      }
    }

    return { body, bodyHtml }
  }

  private extractAttachments(payload: any): Array<{
    filename: string
    mime_type: string
    size: number
    gmail_attachment_id: string
  }> {
    const attachments: Array<{
      filename: string
      mime_type: string
      size: number
      gmail_attachment_id: string
    }> = []

    const extractFromParts = (parts: any[]) => {
      for (const part of parts) {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            filename: part.filename,
            mime_type: part.mimeType || 'application/octet-stream',
            size: part.body.size || 0,
            gmail_attachment_id: part.body.attachmentId
          })
        }
        if (part.parts) {
          extractFromParts(part.parts)
        }
      }
    }

    if (payload.parts) {
      extractFromParts(payload.parts)
    }

    return attachments
  }
}
