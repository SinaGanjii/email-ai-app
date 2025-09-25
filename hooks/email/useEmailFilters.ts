"use client"

export function useEmailFilters() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEmailDisplayName = (email: any) => {
    return email.from_name || email.from_email
  }

  const getEmailStatus = (email: any): "read" | "unread" => {
    return email.is_read ? "read" : "unread"
  }

  const filterEmailsByFolder = (emails: any[], folder: string) => {
    switch (folder) {
      case 'inbox':
        return emails.filter(email => !email.is_sent && !email.is_archived && !email.is_in_trash)
      case 'sent':
        return emails.filter(email => email.is_sent && !email.is_in_trash)
      case 'starred':
        return emails.filter(email => email.is_starred && !email.is_in_trash)
      case 'archive':
        return emails.filter(email => email.is_archived && !email.is_in_trash)
      case 'trash':
        return emails.filter(email => email.is_in_trash)
      default:
        return emails.filter(email => !email.is_sent && !email.is_archived && !email.is_in_trash)
    }
  }

  const cleanHtmlContent = (html: string) => {
    // Remove or replace cid: references that cause ERR_UNKNOWN_URL_SCHEME
    return html
      .replace(/src="cid:[^"]*"/g, 'src=""')
      .replace(/src='cid:[^']*'/g, "src=''")
      .replace(/<img[^>]*src="cid:[^"]*"[^>]*>/g, '<div class="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">[Image non disponible]</div>')
      .replace(/<img[^>]*src='cid:[^']*'[^>]*>/g, '<div class="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">[Image non disponible]</div>')
  }

  return {
    formatDate,
    getEmailDisplayName,
    getEmailStatus,
    filterEmailsByFolder,
    cleanHtmlContent,
  }
}
