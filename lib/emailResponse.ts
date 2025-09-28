export interface ResponseEmailResponse {
  success: boolean
  response?: string
  error?: string
}

/**
 * Calls the email response agent via n8n webhook
 */
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

/**
 * Cleans the email content before sending it for response generation
 */
export function cleanEmailContent(content: string): string {
  if (!content || content.trim() === '') {
    return 'No content available'
  }

  // Remove HTML tags
  let cleaned = content.replace(/<[^>]*>/g, '')
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  // Remove common email signatures and footers
  cleaned = cleaned.replace(/--\s*$.*$/gm, '')
  cleaned = cleaned.replace(/Sent from.*$/gm, '')
  cleaned = cleaned.replace(/Get Outlook for.*$/gm, '')
  
  // Limit length to avoid token limits
  if (cleaned.length > 4000) {
    cleaned = cleaned.substring(0, 4000) + '...'
  }
  
  return cleaned
}
