import { google } from 'googleapis'

export interface GmailClient {
  getProfile(): Promise<any>
  listMessages(params: {
    userId?: string
    maxResults?: number
    q?: string
    pageToken?: string
  }): Promise<any>
  getMessage(params: {
    userId?: string
    id: string
    format?: 'full' | 'minimal' | 'raw'
  }): Promise<any>
  getThread(params: {
    userId?: string
    id: string
    format?: 'full' | 'minimal' | 'metadata'
  }): Promise<any>
}

export function createGmailClient(accessToken: string, refreshToken?: string): GmailClient {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  return {
    async getProfile() {
      return await gmail.users.getProfile({ userId: 'me' })
    },

    async listMessages({ userId = 'me', maxResults = 20, q = '', pageToken }: {
      userId?: string
      maxResults?: number
      q?: string
      pageToken?: string
    }) {
      return await gmail.users.messages.list({
        userId,
        maxResults,
        q,
        pageToken
      })
    },

    async getMessage({ userId = 'me', id, format = 'full' }: {
      userId?: string
      id: string
      format?: 'full' | 'minimal' | 'raw'
    }) {
      return await gmail.users.messages.get({
        userId,
        id,
        format
      })
    },

    async getThread({ userId = 'me', id, format = 'full' }: {
      userId?: string
      id: string
      format?: 'full' | 'minimal' | 'metadata'
    }) {
      return await gmail.users.threads.get({
        userId,
        id,
        format
      })
    }
  }
}

export function validateGmailToken(accessToken: string): boolean {
  return !!accessToken && accessToken.length > 0
}
