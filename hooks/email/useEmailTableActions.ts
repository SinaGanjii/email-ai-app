"use client"

import { useRouter } from "next/navigation"
import { useEmailActions as useEmailActionsHook } from "@/hooks/useEmailActions"
import { useEmailCache } from "@/hooks/useEmailCache"

export function useEmailTableActions() {
  const router = useRouter()
  const { updateEmail, refreshEmails, emails } = useEmailCache()
  const { 
    deleteEmails: deleteEmailsAction, 
    archiveEmails: archiveEmailsAction, 
    starEmails: starEmailsAction, 
    restoreEmails: restoreEmailsAction,
    toggleImportant: toggleImportantAction
  } = useEmailActionsHook()

  const toggleStar = async (emailId: string, filteredEmails: any[]) => {
    // Optimistic update
    updateEmail(emailId, { is_starred: !filteredEmails.find(e => e.id === emailId)?.is_starred })
    
    // Real action
    await starEmailsAction([emailId], {
      onSuccess: () => {
        // Starred successfully
      },
      onError: (error) => {
        // Revert optimistic update
        updateEmail(emailId, { is_starred: !filteredEmails.find(e => e.id === emailId)?.is_starred })
      }
    })
  }

  const toggleImportant = async (emailId: string, filteredEmails: any[]) => {
    // Optimistic update
    updateEmail(emailId, { is_important: !filteredEmails.find(e => e.id === emailId)?.is_important })
    
    // Real action
    await toggleImportantAction([emailId], {
      onSuccess: () => {
        // Important toggled successfully
      },
      onError: (error) => {
        // Revert optimistic update
        updateEmail(emailId, { is_important: !filteredEmails.find(e => e.id === emailId)?.is_important })
      }
    })
  }

  const handleDeleteConfirm = async (selectedEmails: string[], onSuccess: () => void) => {
    // Optimistic update - mark as in trash instead of deleting
    selectedEmails.forEach(emailId => {
      updateEmail(emailId, { is_in_trash: true, is_deleted: false })
    })
    
    // Real action
    await deleteEmailsAction(selectedEmails, {
      onSuccess: () => {
        onSuccess()
      },
      onError: (error) => {
        // Refresh emails to revert optimistic update
        refreshEmails()
      }
    })
  }

  const handleArchiveConfirm = async (selectedEmails: string[], onSuccess: () => void) => {
    // Real action
    await archiveEmailsAction(selectedEmails, {
      onSuccess: () => {
        onSuccess()
      },
      onError: (error) => {
        // Refresh emails to revert optimistic update
        refreshEmails()
      }
    })
  }

  const handleDeleteEmail = async (emailId: string, onSuccess?: () => void) => {
    // Optimistic update - mark as in trash instead of deleting
    updateEmail(emailId, { is_in_trash: true, is_deleted: false })
    
    // Real action
    try {
      await deleteEmailsAction([emailId], {
        onSuccess: (data) => {
          // Email deleted successfully
          onSuccess?.()
        },
        onError: (error) => {
          // Refresh emails to revert optimistic update
          refreshEmails()
        }
      })
    } catch (error) {
      // Refresh emails to revert optimistic update
      refreshEmails()
    }
  }

  const handleArchiveEmail = async (emailId: string, onSuccess?: () => void) => {
    // Real action
    await archiveEmailsAction([emailId], {
      onSuccess: () => {
        // Email archived successfully
        onSuccess?.()
      },
      onError: (error) => {
        // Refresh emails to revert optimistic update
        refreshEmails()
      }
    })
  }

  const handleRestoreConfirm = async (selectedEmails: string[], onSuccess: () => void) => {
    // Optimistic update - restore from trash
    selectedEmails.forEach(emailId => {
      updateEmail(emailId, { is_in_trash: false, is_deleted: false })
    })
    
    // Real action
    await restoreEmailsAction(selectedEmails, {
      onSuccess: () => {
        onSuccess()
      },
      onError: (error) => {
        // Refresh emails to revert optimistic update
        refreshEmails()
      }
    })
  }

  const handleRestoreEmail = async (emailId: string) => {
    // Optimistic update - restore from trash
    updateEmail(emailId, { is_in_trash: false, is_deleted: false })
    
    // Real action
    try {
      await restoreEmailsAction([emailId], {
        onSuccess: (data) => {
          // Email restored successfully
        },
        onError: (error) => {
          // Refresh emails to revert optimistic update
          refreshEmails()
        }
      })
    } catch (error) {
      // Refresh emails to revert optimistic update
      refreshEmails()
    }
  }

  const handleAgentAction = (emailId: string, agent: string) => {
    // Trouver l'email sélectionné
    const email = emails.find(e => e.id === emailId)
    if (!email) return

    const emailData = {
      id: email.id,
      subject: email.subject || 'Sans objet',
      body: email.body || '',
      from: email.from_name || email.from_email || 'Expéditeur inconnu'
    }

    // Stocker l'email dans sessionStorage pour le passer à la page agents
    sessionStorage.setItem('emailToSummarize', JSON.stringify(emailData))

    // Naviguer vers la page agents avec l'agent sélectionné
    router.push(`/agents?agent=${agent}`)
  }

  const handleReply = (email: any) => {
    // Stocker l'email dans sessionStorage pour le passer au modal de réponse
    const replyData = {
      to: email.from_email,
      subject: email.subject?.startsWith('Re: ') ? email.subject : `Re: ${email.subject || 'Sans objet'}`,
      originalEmailId: email.id,
      originalBody: email.body || ''
    }
    
    sessionStorage.setItem('replyEmail', JSON.stringify(replyData))
    
    // Ouvrir le modal de réponse (vous devrez implémenter cette logique)
    // Pour l'instant, on peut rediriger vers une page de composition
    router.push('/compose?reply=true')
  }

  return {
    toggleStar,
    toggleImportant,
    handleDeleteConfirm,
    handleArchiveConfirm,
    handleDeleteEmail,
    handleArchiveEmail,
    handleRestoreConfirm,
    handleRestoreEmail,
    handleAgentAction,
    handleReply,
  }
}