import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createGmailClient, validateGmailToken } from '@/lib/gmail'
import { EmailParser } from '@/lib/emailParser'

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = createRouteHandlerClient({ cookies })
    
    const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: { schema: 'mail' },
        global: {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      }
    )

    const providerToken = session.provider_token
    const providerRefreshToken = session.provider_refresh_token
    
    if (!providerToken || !validateGmailToken(providerToken)) {
      return NextResponse.json({ 
        success: false,
        error: 'Gmail access token required. Please re-authenticate with Google.'
      }, { status: 403 })
    }

    const gmailClient = createGmailClient(providerToken, providerRefreshToken ?? undefined)
    const emailParser = new EmailParser(gmailClient)

    try {
      await gmailClient.getProfile()
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to Gmail. Please check your permissions.'
      }, { status: 403 })
    }

    const messagesResponse = await gmailClient.listMessages({
      maxResults: 50,
      q: 'in:inbox OR in:sent'
    })

    if (!messagesResponse.data.messages?.length) {
      return NextResponse.json({
        success: true,
        message: 'No new messages to sync',
        syncedCount: 0
      })
    }

    let syncedCount = 0
    const errors: string[] = []

    for (const messageRef of messagesResponse.data.messages) {
      try {
        const parsedEmail = await emailParser.parseMessage(messageRef.id!)
        
        if (!parsedEmail) {
          errors.push(`Failed to parse message ${messageRef.id}`)
          continue
        }

        const syncResult = await syncEmailToDatabase(supabase, session.user.id, parsedEmail)
        
        if (syncResult.success) {
          syncedCount++
        } else {
          errors.push(`Failed to sync message ${messageRef.id}: ${syncResult.error}`)
        }
      } catch (error: any) {
        errors.push(`Error processing message ${messageRef.id}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} of ${messagesResponse.data.messages.length} messages`,
      syncedCount,
      totalFound: messagesResponse.data.messages.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Gmail sync failed',
      details: error.message
    }, { status: 500 })
  }
}

async function syncEmailToDatabase(supabase: any, userId: string, parsedEmail: any) {
  try {
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .upsert({
        user_id: userId,
        subject: parsedEmail.thread.subject,
        snippet: parsedEmail.thread.snippet,
        history_id: parsedEmail.thread.history_id,
        gmail_thread_id: parsedEmail.thread.gmail_thread_id
      }, {
        onConflict: 'gmail_thread_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (threadError) {
      return { success: false, error: `Thread sync failed: ${threadError.message}` }
    }

    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .upsert({
        thread_id: threadData.id,
        user_id: userId,
        gmail_id: parsedEmail.message.gmail_id,
        gmail_message_id: parsedEmail.message.gmail_message_id,
        from_email: parsedEmail.message.from_email,
        from_name: parsedEmail.message.from_name,
        to_emails: parsedEmail.message.to_emails,
        cc_emails: parsedEmail.message.cc_emails,
        bcc_emails: parsedEmail.message.bcc_emails,
        subject: parsedEmail.message.subject,
        body: parsedEmail.message.body,
        body_html: parsedEmail.message.body_html,
        is_read: parsedEmail.message.is_read,
        is_starred: parsedEmail.message.is_starred,
        is_important: parsedEmail.message.is_important,
        is_sent: parsedEmail.message.is_sent,
        sent_at: parsedEmail.message.sent_at,
        received_at: parsedEmail.message.received_at
      }, {
        onConflict: 'gmail_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (messageError) {
      return { success: false, error: `Message sync failed: ${messageError.message}` }
    }

    await syncLabels(supabase, userId, messageData.id, parsedEmail.labels)

    await syncAttachments(supabase, messageData.id, parsedEmail.attachments)

    return { success: true }

  } catch (error: any) {
    return { success: false, error: `Database sync failed: ${error.message}` }
  }
}

async function syncLabels(supabase: any, userId: string, messageId: string, gmailLabels: string[]) {
  try {
    for (const labelName of gmailLabels) {
      await supabase
        .from('labels')
        .upsert({
          user_id: userId,
          name: labelName,
          type: ['INBOX', 'SENT', 'STARRED', 'IMPORTANT', 'DRAFT', 'SPAM', 'TRASH'].includes(labelName) ? 'system' : 'custom'
        }, {
          onConflict: 'user_id,name',
          ignoreDuplicates: true
        })
    }

    const { data: labels } = await supabase
      .from('labels')
      .select('id, name')
      .eq('user_id', userId)
      .in('name', gmailLabels)

    if (!labels?.length) return

    await supabase
      .from('message_labels')
      .delete()
      .eq('message_id', messageId)

    await supabase
      .from('message_labels')
      .insert(
        labels.map((label: { id: string; name: string }) => ({
          message_id: messageId,
          label_id: label.id
        }))
      )
  } catch (error) {
  }
}

async function syncAttachments(supabase: any, messageId: string, attachments: any[]) {
  try {
    await supabase
      .from('attachments')
      .delete()
      .eq('message_id', messageId)

    if (attachments.length > 0) {
      await supabase
        .from('attachments')
        .insert(
          attachments.map(attachment => ({
            message_id: messageId,
            filename: attachment.filename,
            mime_type: attachment.mime_type,
            size: attachment.size,
            gmail_attachment_id: attachment.gmail_attachment_id
          }))
        )
    }
  } catch (error) {
  }
}
