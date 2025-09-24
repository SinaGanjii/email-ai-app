"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useEmailCache, SyncedEmail } from "@/hooks/useEmailCache"
import { useEmailActions } from "@/hooks/useEmailActions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Archive, 
  Trash2, 
  Star, 
  Send, 
  RotateCcw,
  MoreVertical,
  RefreshCw,
  Loader2
} from "lucide-react"
import { Modal } from "@/components/ui/modal"

interface EmailTableProps {
  folder: 'inbox' | 'sent' | 'starred' | 'archive' | 'trash'
  title: string
  icon: React.ComponentType<{ className?: string }>
  iconColor?: string
}

export function EmailTable({ folder, title, icon: Icon, iconColor = "text-gray-500" }: EmailTableProps) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { emails, loading, error: fetchError, refreshEmails, updateEmail, deleteEmails, archiveEmails, starEmails, restoreEmails } = useEmailCache()
  const { deleteEmails: deleteEmailsAction, archiveEmails: archiveEmailsAction, starEmails: starEmailsAction, restoreEmails: restoreEmailsAction, loading: actionLoading } = useEmailActions()
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)

  // Filtrer les emails selon le dossier
  const filteredEmails = emails.filter(email => {
    switch (folder) {
      case 'inbox':
        return !email.is_sent && !email.is_archived && !email.is_in_trash
      case 'sent':
        return email.is_sent && !email.is_in_trash
      case 'starred':
        return email.is_starred && !email.is_in_trash
      case 'archive':
        return email.is_archived && !email.is_in_trash
      case 'trash':
        return email.is_in_trash
      default:
        return false
    }
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEmailDisplayName = (email: SyncedEmail) => {
    if (folder === 'sent') {
      return `To: ${email.to_emails[0] || 'Unknown'}`
    }
    return email.from_name || email.from_email
  }

  const toggleEmailSelection = (emailId: string) => {
    setSelectedEmails((prev) => (prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]))
  }

  const toggleAllEmails = () => {
    setSelectedEmails(selectedEmails.length === filteredEmails.length ? [] : filteredEmails.map((email) => email.id))
  }

  const handleDeleteConfirm = async () => {
    // Optimistic update - mark as in trash instead of deleting
    selectedEmails.forEach(emailId => {
      updateEmail(emailId, { is_in_trash: true, is_deleted: false })
    })
    
    // Real action
    await deleteEmailsAction(selectedEmails, {
      onSuccess: () => {
        console.log('Emails processed successfully')
        setSelectedEmails([])
      },
      onError: (error) => {
        console.error('Failed to process emails:', error)
        refreshEmails()
      }
    })
  }

  const handleArchiveConfirm = async () => {
    // Optimistic update
    archiveEmails(selectedEmails)
    
    // Real action
    await archiveEmailsAction(selectedEmails, {
      onSuccess: () => {
        console.log('Emails archived successfully')
        setSelectedEmails([])
      },
      onError: (error) => {
        console.error('Failed to archive emails:', error)
        refreshEmails()
      }
    })
  }

  const handleRestoreConfirm = async () => {
    // Optimistic update
    restoreEmails(selectedEmails)
    
    // Real action
    await restoreEmailsAction(selectedEmails, {
      onSuccess: () => {
        console.log('Emails restored successfully')
        setSelectedEmails([])
      },
      onError: (error) => {
        console.error('Failed to restore emails:', error)
        refreshEmails()
      }
    })
  }

  const handleStarToggle = async (emailId: string) => {
    // Optimistic update
    updateEmail(emailId, { is_starred: !emails.find(e => e.id === emailId)?.is_starred })
    
    // Real action
    await starEmailsAction([emailId], {
      onSuccess: () => {
        console.log('Email starred successfully')
      },
      onError: (error) => {
        console.error('Failed to star email:', error)
        updateEmail(emailId, { is_starred: !emails.find(e => e.id === emailId)?.is_starred })
      }
    })
  }

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading {title}...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Vous devez être connecté pour voir vos emails.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 min-w-0">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
          <Checkbox 
            className="h-4 w-4" 
            checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
            onCheckedChange={toggleAllEmails}
          />
          
          {folder === 'trash' && (
            <Button variant="ghost" size="sm" className="p-1 sm:p-2" onClick={() => setRestoreModalOpen(true)} disabled={selectedEmails.length === 0 || actionLoading}>
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
          
          {folder !== 'trash' && (
            <Button variant="ghost" size="sm" className="p-1 sm:p-2" onClick={() => setArchiveModalOpen(true)} disabled={selectedEmails.length === 0 || actionLoading}>
              <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
          
          <Button variant="ghost" size="sm" className="p-1 sm:p-2" onClick={() => setDeleteModalOpen(true)} disabled={selectedEmails.length === 0 || actionLoading}>
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="p-1 sm:p-2" onClick={refreshEmails}>
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
            {filteredEmails.length > 0 ? `1-${filteredEmails.length} of ${filteredEmails.length}` : '0 emails'}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 sm:hidden">
            {filteredEmails.length}
          </span>
          <Button variant="ghost" size="sm" className="p-1 sm:p-2">
            <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading {title}...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {fetchError && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error: {fetchError}</p>
            <Button onClick={refreshEmails}>Retry</Button>
          </div>
        </div>
      )}

      {/* Email List */}
      {!loading && !fetchError && (
        <div className="flex-1 overflow-auto w-full">
          {filteredEmails.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Icon className={`h-12 w-12 ${iconColor} mx-auto mb-4`} />
                <p className="text-muted-foreground">No emails in {title.toLowerCase()}</p>
              </div>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                className="flex items-center gap-1 sm:gap-2 md:gap-3 px-2 sm:px-4 py-2 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group h-10 min-w-0"
              >
                <Checkbox 
                  className="flex-shrink-0 h-4 w-4" 
                  checked={selectedEmails.includes(email.id)}
                  onCheckedChange={() => toggleEmailSelection(email.id)}
                />
                
                <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor} flex-shrink-0`} />
                
                <div className="flex-1 flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0">
                  <span
                    className={`font-medium text-xs sm:text-sm w-20 sm:w-24 md:w-32 truncate ${
                      !email.is_read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                    } ${folder === 'trash' ? 'line-through' : ''}`}
                  >
                    {getEmailDisplayName(email)}
                  </span>
                  <span
                    className={`flex-1 text-xs sm:text-sm truncate ${
                      !email.is_read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                    } ${folder === 'trash' ? 'line-through' : ''}`}
                  >
                    {email.subject}
                  </span>
                </div>
                
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8 sm:w-10 md:w-12 text-right group-hover:hidden flex-shrink-0">
                  {formatDate(email.sent_at || email.received_at)}
                </span>
                
                <div className="hidden group-hover:flex items-center gap-1">
                  {folder !== 'starred' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStarToggle(email.id)
                      }}
                    >
                      <Star className={`h-2 w-2 sm:h-3 sm:w-3 ${email.is_starred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                    </Button>
                  )}
                  
                  {folder === 'trash' ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEmails([email.id])
                        setRestoreModalOpen(true)
                      }}
                    >
                      <RotateCcw className="h-2 w-2 sm:h-3 sm:w-3" />
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEmails([email.id])
                        setArchiveModalOpen(true)
                      }}
                    >
                      <Archive className="h-2 w-2 sm:h-3 sm:w-3" />
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEmails([email.id])
                      setDeleteModalOpen(true)
                    }}
                  >
                    <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Confirmation Modals */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={folder === 'trash' ? "Confirm Permanent Deletion" : "Confirm Deletion"}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                folder === 'trash' ? "Delete Permanently" : "Move to Trash"
              )}
            </Button>
          </div>
        }
      >
        <p className="text-muted-foreground">
          {folder === 'trash' 
            ? "Are you sure you want to permanently delete the selected emails? This action cannot be undone." 
            : "Are you sure you want to move the selected emails to trash?"
          }
        </p>
      </Modal>
      
      <Modal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        title="Confirm Archive"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setArchiveModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleArchiveConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Archive"
              )}
            </Button>
          </div>
        }
      >
        <p className="text-muted-foreground">
          Are you sure you want to archive the selected emails?
        </p>
      </Modal>
      
      <Modal
        isOpen={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        title="Confirm Restore"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRestoreModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRestoreConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Restore"
              )}
            </Button>
          </div>
        }
      >
        <p className="text-muted-foreground">
          Are you sure you want to restore the selected emails from trash?
        </p>
      </Modal>
    </div>
  )
}
