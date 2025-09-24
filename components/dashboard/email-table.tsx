"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Modal } from "@/components/ui/modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, XCircle } from "lucide-react"
import {
  Star,
  Archive,
  Trash2,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  FileText,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Reply,
  RotateCcw,
  ReplyAll,
  Forward,
  Printer,
  Flag,
  MoreHorizontal,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useEmailCache } from "@/hooks/useEmailCache"
import { useEmailActions } from "@/hooks/useEmailActions"

interface SyncedEmail {
  id: string
  subject: string
  from_email: string
  from_name: string
  to_emails: string[]
  body: string | null
  body_html: string | null
  is_read: boolean
  is_starred: boolean
  is_important: boolean
  is_sent: boolean
  is_archived: boolean
  is_deleted: boolean
  is_in_trash: boolean
  sent_at: string | null
  received_at: string
}

interface EmailTableProps {
  folder?: 'inbox' | 'sent' | 'starred' | 'archive' | 'trash'
  title?: string
}

export function EmailTable({ folder = 'inbox', title = 'Inbox' }: EmailTableProps = {}) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { emails, loading, error: fetchError, refreshEmails, updateEmail, deleteEmail, deleteEmails, archiveEmails, starEmails, markAsRead } = useEmailCache()
  const { deleteEmails: deleteEmailsAction, archiveEmails: archiveEmailsAction, starEmails: starEmailsAction, markAsRead: markAsReadAction, restoreEmails: restoreEmailsAction, loading: actionLoading } = useEmailActions()
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [hoveredEmail, setHoveredEmail] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<SyncedEmail | null>(null)

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
        return !email.is_sent && !email.is_archived && !email.is_in_trash
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
    return email.from_name || email.from_email
  }

  const getEmailStatus = (email: SyncedEmail): "read" | "unread" | "important" => {
    if (email.is_important) return "important"
    return email.is_read ? "read" : "unread"
  }

  const toggleEmailSelection = (emailId: string) => {
    setSelectedEmails((prev) => (prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]))
  }

  const toggleAllEmails = () => {
    setSelectedEmails(selectedEmails.length === filteredEmails.length ? [] : filteredEmails.map((email) => email.id))
  }

  const toggleStar = async (emailId: string) => {
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

  const handleDeleteConfirm = async () => {
    // Optimistic update - mark as in trash instead of deleting
    selectedEmails.forEach(emailId => {
      updateEmail(emailId, { is_in_trash: true, is_deleted: false })
    })
    
    // Real action
    await deleteEmailsAction(selectedEmails, {
      onSuccess: () => {
        setSelectedEmails([])
        setDeleteModalOpen(false)
      },
      onError: (error) => {
        // Refresh emails to revert optimistic update
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
        setSelectedEmails([])
        setArchiveModalOpen(false)
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
    // Optimistic update
    archiveEmails([emailId])
    
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

  const handleRestoreConfirm = async () => {
    // Optimistic update - restore from trash
    selectedEmails.forEach(emailId => {
      updateEmail(emailId, { is_in_trash: false, is_deleted: false })
    })
    
    // Real action
    await restoreEmailsAction(selectedEmails, {
      onSuccess: () => {
        setSelectedEmails([])
        setRestoreModalOpen(false)
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

  const openEmail = (email: SyncedEmail) => {
    setSelectedEmail(email)
  }

  const cleanHtmlContent = (html: string) => {
    // Remove or replace cid: references that cause ERR_UNKNOWN_URL_SCHEME
    return html
      .replace(/src="cid:[^"]*"/g, 'src=""')
      .replace(/src='cid:[^']*'/g, "src=''")
      .replace(/<img[^>]*src="cid:[^"]*"[^>]*>/g, '<div class="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">[Image non disponible]</div>')
      .replace(/<img[^>]*src='cid:[^']*'[^>]*>/g, '<div class="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">[Image non disponible]</div>')
  }

  // Attendre que l'authentification soit vérifiée
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Vérification de l'authentification...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-8">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté pour voir vos emails.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Chargement des emails...</span>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center py-8">
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Erreur lors du chargement des emails:</strong> {fetchError}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Si un email est sélectionné, afficher la vue email
  if (selectedEmail) {
    return (
      <div className="flex flex-col w-full h-full bg-white">
        {/* Header Bar - Minimal Gmail Style */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedEmail(null)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
                <Archive className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
                <Trash2 className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
                <Flag className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>1 sur 1</span>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
              <Printer className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Subject Line - Clean and Minimal */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-2xl font-normal text-gray-900 mb-2">
            {selectedEmail.subject || '(Sans objet)'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              Boîte de réception
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(selectedEmail.sent_at || selectedEmail.received_at)}
            </span>
          </div>
        </div>


        {/* Email Content - Gmail Style Layout */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="px-6 py-4">
            {/* Sender Info - Gmail Style Layout */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {getEmailDisplayName(selectedEmail).charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{getEmailDisplayName(selectedEmail)}</span>
                    <span className="text-gray-500 text-sm">&lt;{selectedEmail.from_email}&gt;</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-gray-500 text-sm">À moi</span>
                    <span className="text-gray-400 text-sm">▼</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {formatDate(selectedEmail.sent_at || selectedEmail.received_at)}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleStar(selectedEmail.id)}
                  className={`p-1 ${selectedEmail.is_starred ? "text-yellow-500" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Star className={`h-4 w-4 ${selectedEmail.is_starred ? "fill-current" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-gray-600">
                  <Reply className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Email Body - Clean Typography */}
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-800 leading-relaxed text-base">
                {selectedEmail.body_html ? (
                  <div 
                    className="email-content prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-a:text-blue-600 prose-strong:text-gray-900 prose-blockquote:text-gray-600 prose-img:rounded-lg prose-img:shadow-sm"
                    dangerouslySetInnerHTML={{ __html: cleanHtmlContent(selectedEmail.body_html) }}
                  />
                ) : selectedEmail.body ? (
                  <div className="whitespace-pre-wrap">
                    {selectedEmail.body}
                  </div>
                ) : (
                  <div className="text-gray-500 italic py-8 text-center">
                    Aucun contenu disponible. Le contenu complet de l'email sera disponible après la synchronisation complète avec Gmail.
                  </div>
                )}
              </div>
            </div>

            {/* Status Badges - Subtle */}
            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
              {selectedEmail.is_starred && (
                <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full border border-yellow-200">
                  ⭐ Favori
                </span>
              )}
              {selectedEmail.is_important && (
                <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
                  Important
                </span>
              )}
              {!selectedEmail.is_read && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                  Non lu
                </span>
              )}
              {selectedEmail.is_sent && (
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                  Envoyé
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full max-w-full">
      <div className="flex items-center justify-between p-2 sm:p-4 border-b border-border min-w-0 bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Checkbox checked={selectedEmails.length === filteredEmails.length} onCheckedChange={toggleAllEmails} className="h-4 w-4" />
            <Button variant="ghost" size="sm" className="p-1 sm:p-2" onClick={refreshEmails}>
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1 sm:p-2">
              <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {selectedEmails.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-2">
              {folder === 'trash' ? (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setRestoreModalOpen(true)} className="p-1 sm:p-2">
                    <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteModalOpen(true)} className="p-1 sm:p-2">
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setArchiveModalOpen(true)} className="p-1 sm:p-2">
                    <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteModalOpen(true)} className="p-1 sm:p-2">
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="hidden sm:inline">
            1-{filteredEmails.length} of {filteredEmails.length}
          </span>
          <span className="sm:hidden">
            {filteredEmails.length}
          </span>
          <Button variant="ghost" size="sm" disabled className="p-1 sm:p-2">
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button variant="ghost" size="sm" disabled className="p-1 sm:p-2">
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      <div className="w-full">
        <div className="divide-y divide-border min-w-0">
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              className={`flex items-center px-2 sm:px-4 py-2 cursor-pointer hover:shadow-sm transition-all duration-150 min-w-0 ${
                getEmailStatus(email) === "unread" ? "bg-background font-medium" : "bg-background/50"
              } ${hoveredEmail === email.id ? "shadow-sm" : ""}`}
              onMouseEnter={() => setHoveredEmail(email.id)}
              onMouseLeave={() => setHoveredEmail(null)}
              onClick={() => openEmail(email)}
              style={{ height: "40px" }} // Fixed Gmail-style row height
            >
              <div className="flex items-center gap-1 sm:gap-2 w-12 sm:w-14 flex-shrink-0">
                <Checkbox
                  checked={selectedEmails.includes(email.id)}
                  onCheckedChange={() => toggleEmailSelection(email.id)}
                  className="h-4 w-4"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 sm:h-5 sm:w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleStar(email.id)
                  }}
                >
                  <Star
                    className={`h-3 w-3 ${email.is_starred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                  />
                </Button>
              </div>

              <div className="w-24 sm:w-40 md:w-48 flex-shrink-0 min-w-0">
                <span
                  className={`text-xs sm:text-sm truncate block ${getEmailStatus(email) === "unread" ? "font-semibold text-foreground" : "text-foreground"}`}
                >
                  {getEmailDisplayName(email)}
                </span>
              </div>

              <div className="flex-1 min-w-0 px-1 sm:px-2 md:px-4 relative">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-2">
                    <p
                      className={`text-xs sm:text-sm truncate ${getEmailStatus(email) === "unread" ? "font-semibold text-foreground" : "font-medium text-foreground"}`}
                    >
                      {email.subject || '(Sans objet)'}
                    </p>
                    <span className="text-xs text-muted-foreground hidden sm:inline">-</span>
                    <p className="text-xs text-muted-foreground truncate flex-1 hidden md:block">
                      {email.subject ? email.subject.substring(0, 100) + (email.subject.length > 100 ? '...' : '') : 'Aucun objet'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {hoveredEmail === email.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in-0 duration-200">
                        {folder === 'trash' ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 hover:bg-green-500/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRestoreEmail(email.id)
                              }}
                              title="Restore to Inbox"
                            >
                              <RotateCcw className="h-3 w-3 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 hover:bg-red-500/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteEmail(email.id)
                              }}
                              title="Delete Forever"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 hover:bg-purple-500/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAgentAction(email.id, "cleanup")
                              }}
                              title="Cleanup Agent"
                            >
                              <Sparkles className="h-3 w-3 text-purple-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 hover:bg-blue-500/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAgentAction(email.id, "smart-reply")
                              }}
                              title="Smart Reply Agent"
                            >
                              <MessageSquare className="h-3 w-3 text-blue-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 hover:bg-green-500/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAgentAction(email.id, "summary")
                              }}
                              title="Summary Agent"
                            >
                              <FileText className="h-3 w-3 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 hover:bg-orange-500/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleArchiveEmail(email.id)
                              }}
                              title="Archive"
                            >
                              <Archive className="h-3 w-3 text-orange-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 hover:bg-red-500/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteEmail(email.id)
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground flex-shrink-0">{formatDate(email.sent_at || email.received_at)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={folder === 'trash' ? "Delete Forever" : "Delete Emails"}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {folder === 'trash' ? 'Delete Forever' : 'Delete'}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <p className="text-foreground">
              {folder === 'trash' 
                ? `Are you sure you want to permanently delete ${selectedEmails.length} email${selectedEmails.length > 1 ? "s" : ""}?`
                : `Are you sure you want to delete ${selectedEmails.length} email${selectedEmails.length > 1 ? "s" : ""}?`
              }
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {folder === 'trash' 
                ? "This will permanently remove the emails from your account."
                : "This action cannot be undone."
              }
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        title="Archive Emails"
        footer={
          <>
            <Button variant="outline" onClick={() => setArchiveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleArchiveConfirm}>Archive</Button>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <Archive className="h-5 w-5 text-primary" />
          <div>
            <p className="text-foreground">
              Archive {selectedEmails.length} email{selectedEmails.length > 1 ? "s" : ""}?
            </p>
            <p className="text-sm text-muted-foreground mt-1">You can find archived emails in your archive folder.</p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        title="Restore Emails"
        footer={
          <>
            <Button variant="outline" onClick={() => setRestoreModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestoreConfirm}>
              Restore
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <RotateCcw className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-foreground">
              Restore {selectedEmails.length} email{selectedEmails.length > 1 ? "s" : ""} to inbox?
            </p>
            <p className="text-sm text-muted-foreground mt-1">Emails will be moved back to your inbox.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
