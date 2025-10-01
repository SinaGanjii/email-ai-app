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
    updateEmail(emailId, { is_starred: !filteredEmails.find(e => e.id === emailId)?.is_starred })
    
    await starEmailsAction([emailId], {
      onSuccess: () => {
      },
      onError: (error) => {
        updateEmail(emailId, { is_starred: !filteredEmails.find(e => e.id === emailId)?.is_starred })
      }
    })
  }

  const toggleImportant = async (emailId: string, filteredEmails: any[]) => {
    updateEmail(emailId, { is_important: !filteredEmails.find(e => e.id === emailId)?.is_important })
    
    await toggleImportantAction([emailId], {
      onSuccess: () => {
      },
      onError: (error) => {
        updateEmail(emailId, { is_important: !filteredEmails.find(e => e.id === emailId)?.is_important })
      }
    })
  }

  const handleDeleteConfirm = async (selectedEmails: string[], onSuccess: () => void) => {
    selectedEmails.forEach(emailId => {
      updateEmail(emailId, { is_in_trash: true, is_deleted: false })
    })
    
    await deleteEmailsAction(selectedEmails, {
      onSuccess: () => {
        onSuccess()
      },
      onError: (error) => {
        refreshEmails()
      }
    })
  }

  const handleArchiveConfirm = async (selectedEmails: string[], onSuccess: () => void) => {
    await archiveEmailsAction(selectedEmails, {
      onSuccess: () => {
        onSuccess()
      },
      onError: (error) => {
        refreshEmails()
      }
    })
  }

  const handleDeleteEmail = async (emailId: string, onSuccess?: () => void) => {
    updateEmail(emailId, { is_in_trash: true, is_deleted: false })
    
    try {
      await deleteEmailsAction([emailId], {
        onSuccess: (data) => {
          onSuccess?.()
        },
        onError: (error) => {
          refreshEmails()
        }
      })
    } catch (error) {
      refreshEmails()
    }
  }

  const handleArchiveEmail = async (emailId: string, onSuccess?: () => void) => {
    await archiveEmailsAction([emailId], {
      onSuccess: () => {
        onSuccess?.()
      },
      onError: (error) => {
        refreshEmails()
      }
    })
  }

  const handleRestoreConfirm = async (selectedEmails: string[], onSuccess: () => void) => {
    selectedEmails.forEach(emailId => {
      updateEmail(emailId, { is_in_trash: false, is_deleted: false })
    })
    
    await restoreEmailsAction(selectedEmails, {
      onSuccess: () => {
        onSuccess()
      },
      onError: (error) => {
        refreshEmails()
      }
    })
  }

  const handleRestoreEmail = async (emailId: string) => {
    updateEmail(emailId, { is_in_trash: false, is_deleted: false })
    
    try {
      await restoreEmailsAction([emailId], {
        onSuccess: (data) => {
        },
        onError: (error) => {
          refreshEmails()
        }
      })
    } catch (error) {
      refreshEmails()
    }
  }

  const handleAgentAction = (emailId: string, agent: string) => {
    const email = emails.find(e => e.id === emailId)
    if (!email) return

    const emailData = {
      id: email.id,
      subject: email.subject || 'Sans objet',
      body: email.body || '',
      from: email.from_name || email.from_email || 'Expéditeur inconnu'
    }

    sessionStorage.setItem('emailToSummarize', JSON.stringify(emailData))

    router.push(`/agents?agent=${agent}`)
  }

  const handleReply = (email: any) => {
    const replyData = {
      to: email.from_email,
      subject: email.subject?.startsWith('Re: ') ? email.subject : `Re: ${email.subject || 'Sans objet'}`,
      originalEmailId: email.id,
      originalBody: email.body || ''
    }
    
    sessionStorage.setItem('replyEmail', JSON.stringify(replyData))
    
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