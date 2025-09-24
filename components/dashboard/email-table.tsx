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
  ReplyAll,
  Forward,
  Printer,
  Flag,
  MoreHorizontal,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

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
  sent_at: string | null
  received_at: string
}

export function EmailTable() {
  const { isAuthenticated } = useAuth()
  const [emails, setEmails] = useState<SyncedEmail[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [hoveredEmail, setHoveredEmail] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<SyncedEmail | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails()
    }
  }, [isAuthenticated])

  const fetchEmails = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const response = await fetch('/api/emails')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setEmails(data.emails || [])
      } else {
        const errorMsg = data.error || 'Unknown error'
        console.error('Error fetching emails:', errorMsg)
        setFetchError(errorMsg)
        setEmails([])
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error'
      console.error('Error fetching emails:', errorMsg)
      setFetchError(errorMsg)
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

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
    setSelectedEmails(selectedEmails.length === emails.length ? [] : emails.map((email) => email.id))
  }

  const toggleStar = (emailId: string) => {
    setEmails((prev) => prev.map((email) => (email.id === emailId ? { ...email, is_starred: !email.is_starred } : email)))
  }

  const handleDeleteConfirm = () => {
    setEmails((prev) => prev.filter((email) => !selectedEmails.includes(email.id)))
    setSelectedEmails([])
    setDeleteModalOpen(false)
  }

  const handleArchiveConfirm = () => {
    setEmails((prev) => prev.filter((email) => !selectedEmails.includes(email.id)))
    setSelectedEmails([])
    setArchiveModalOpen(false)
  }

  const handleDeleteEmail = (emailId: string) => {
    setEmails((prev) => prev.filter((email) => email.id !== emailId))
  }

  const handleArchiveEmail = (emailId: string) => {
    setEmails((prev) => prev.filter((email) => email.id !== emailId))
  }

  const handleAgentAction = (emailId: string, agent: string) => {
    console.log(`Using ${agent} agent on email ${emailId}`)
  }

  const openEmail = (email: SyncedEmail) => {
    setSelectedEmail(email)
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
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
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

        {/* Action Buttons - Minimal Row */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
              <Reply className="h-4 w-4 mr-2" />
              Répondre
            </Button>
            <Button variant="ghost" size="sm" className="px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
              <ReplyAll className="h-4 w-4 mr-2" />
              Répondre à tous
            </Button>
            <Button variant="ghost" size="sm" className="px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
              <Forward className="h-4 w-4 mr-2" />
              Transférer
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleStar(selectedEmail.id)}
              className={`p-2 rounded-full ${selectedEmail.is_starred ? "text-yellow-500" : "text-gray-600 hover:bg-gray-200"}`}
            >
              <Star className={`h-5 w-5 ${selectedEmail.is_starred ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Email Content - Clean Layout */}
        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            {/* Sender Info - Clean Card Style */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                {getEmailDisplayName(selectedEmail).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{getEmailDisplayName(selectedEmail)}</span>
                  <span className="text-gray-500 text-sm">{selectedEmail.from_email}</span>
                </div>
                <div className="text-sm text-gray-500 mb-1">À moi</div>
                <div className="text-sm text-gray-500">
                  {formatDate(selectedEmail.sent_at || selectedEmail.received_at)}
                </div>
              </div>
            </div>

            {/* Email Body - Clean Typography */}
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-800 leading-relaxed text-base">
                {selectedEmail.body_html ? (
                  <div 
                    className="email-content prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-a:text-blue-600 prose-strong:text-gray-900 prose-blockquote:text-gray-600"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
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
            <div className="flex gap-2 mt-8 pt-6 border-t border-gray-100">
              {selectedEmail.is_starred && (
                <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-sm rounded-full border border-yellow-200">
                  ⭐ Favori
                </span>
              )}
              {selectedEmail.is_important && (
                <span className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-200">
                  Important
                </span>
              )}
              {!selectedEmail.is_read && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                  Non lu
                </span>
              )}
              {selectedEmail.is_sent && (
                <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
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
            <Checkbox checked={selectedEmails.length === emails.length} onCheckedChange={toggleAllEmails} className="h-4 w-4" />
            <Button variant="ghost" size="sm" className="p-1 sm:p-2" onClick={fetchEmails}>
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1 sm:p-2">
              <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {selectedEmails.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button size="sm" variant="ghost" onClick={() => setArchiveModalOpen(true)} className="p-1 sm:p-2">
                <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteModalOpen(true)} className="p-1 sm:p-2">
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="hidden sm:inline">
            1-{emails.length} of {emails.length}
          </span>
          <span className="sm:hidden">
            {emails.length}
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
          {emails.map((email) => (
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
        title="Delete Emails"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <p className="text-foreground">
              Are you sure you want to delete {selectedEmails.length} email{selectedEmails.length > 1 ? "s" : ""}?
            </p>
            <p className="text-sm text-muted-foreground mt-1">This action cannot be undone.</p>
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
    </div>
  )
}
