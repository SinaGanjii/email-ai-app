"use client"

import { useEmailActions as useEmailActionsHook } from "@/hooks/useEmailActions"
import { useEmailCache } from "@/hooks/useEmailCache"

export function useEmailTableActions() {
  const { updateEmail, refreshEmails } = useEmailCache()
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

  const handleDeleteEmail = async (emailId: string) => {
    // Optimistic update - mark as in trash instead of deleting
    updateEmail(emailId, { is_in_trash: true, is_deleted: false })
    
    // Real action
    try {
      await deleteEmailsAction([emailId], {
        onSuccess: (data) => {
          // Email deleted successfully
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

  const handleArchiveEmail = async (emailId: string) => {
    // Real action
    await archiveEmailsAction([emailId], {
      onSuccess: () => {
        // Email archived successfully
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
    // Agent action placeholder
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
  }
}