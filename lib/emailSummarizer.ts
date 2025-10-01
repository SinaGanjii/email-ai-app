
export interface SummarizeEmailRequest {
  body: string
}

export interface SummarizeEmailResponse {
  success: boolean
  summary?: string
  error?: string
}

export async function summarizeEmail(emailBody: string): Promise<SummarizeEmailResponse> {
  try {
    const cleanedBody = cleanEmailContent(emailBody)
    
    const response = await fetch(
      'https://sisis012.app.n8n.cloud/webhook/summarize-email',
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

    const summary =
      data.content ||
      data.summary ||
      data.message ||
      data.response ||
      data.text ||
      (Array.isArray(data) && data[0]?.message?.content) ||
      'No summary returned'

    return { success: true, summary }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error while summarizing email'
    }
  }
}

export function cleanEmailContent(content: string): string {
  if (!content || content.trim() === '') {
    return 'No content available'
  }

  let cleaned = content.replace(/<[^>]*>/g, '')
  
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()

  if (cleaned.length === 0) {
    return 'No readable content found'
  }

  return cleaned.length > 2000
    ? cleaned.substring(0, 2000) + '...'
    : cleaned
}
