/**
 * Service to call the email summarizer agent
 */

export interface SummarizeEmailRequest {
  body: string
}

export interface SummarizeEmailResponse {
  success: boolean
  summary?: string
  error?: string
}

/**
 * Calls the email summarizer agent via n8n webhook
 */
export async function summarizeEmail(emailBody: string): Promise<SummarizeEmailResponse> {
  try {
    const cleanedBody = cleanEmailContent(emailBody)
    console.log('📤 Sending to n8n:', { email_content: cleanedBody })
    
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
    console.log('📊 API Response:', data)

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

/**
 * Cleans the email content before sending it for summarization
 */
export function cleanEmailContent(content: string): string {
  if (!content || content.trim() === '') {
    return 'No content available'
  }

  // Supprime les balises HTML
  let cleaned = content.replace(/<[^>]*>/g, '')
  
  // Supprime les caractères de contrôle et normalise les espaces
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()

  // Vérifie que le contenu n'est pas vide après nettoyage
  if (cleaned.length === 0) {
    return 'No readable content found'
  }

  // Limite la longueur pour éviter les requêtes trop longues
  return cleaned.length > 2000
    ? cleaned.substring(0, 2000) + '...'
    : cleaned
}
