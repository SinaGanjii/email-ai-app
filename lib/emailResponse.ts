export interface ResponseEmailResponse {
  success: boolean
  response?: string
  error?: string
}

export async function generateEmailResponse(emailBody: string): Promise<ResponseEmailResponse> {
  try {
    const cleanedBody = cleanEmailContent(emailBody)
    
    const response = await fetch(
      'https://sisis012.app.n8n.cloud/webhook/response-email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email_content: cleanedBody })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const data = await response.json()

    const responseText =
      data.content ||
      data.response ||
      data.message ||
      data.text ||
      (Array.isArray(data) && data[0]?.message?.content) ||
      'No response generated'

    return { success: true, response: responseText }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error while generating email response'
    }
  }
}

export function cleanEmailContent(content: string): string {
  if (!content || content.trim() === '') {
    return 'No content available'
  }

  let cleaned = content.replace(/<[^>]*>/g, '')
  
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  cleaned = cleaned.replace(/--\s*$.*$/gm, '')
  cleaned = cleaned.replace(/Sent from.*$/gm, '')
  cleaned = cleaned.replace(/Get Outlook for.*$/gm, '')
  
  if (cleaned.length > 4000) {
    cleaned = cleaned.substring(0, 4000) + '...'
  }
  
  return cleaned
}
