"use client"

import { useAuth } from "@/hooks/useAuth"
import { useEmailCache } from "@/hooks/useEmailCache"
import { useEmailTableState } from "@/hooks/email/useEmailTableState"
import { useEmailTableActions } from "@/hooks/email/useEmailTableActions"
import { useEmailFilters } from "@/hooks/email/useEmailFilters"
import { EmailListView } from "./EmailListView"
import { EmailDetailHeader, EmailDetailContent } from "./EmailDetailView"
import { EmailModals } from "./EmailModals"
import { Loader2, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EmailTableProps {
  folder?: 'inbox' | 'sent' | 'starred' | 'archive' | 'trash'
  title?: string
}

export function EmailTable({ folder = 'inbox', title = 'Inbox' }: EmailTableProps = {}) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { emails, loading, error: fetchError, refreshEmails } = useEmailCache()
  const {
    selectedEmails,
    deleteModalOpen,
    archiveModalOpen,
    restoreModalOpen,
    selectedEmail,
    hoveredEmail,
    setHoveredEmail,
    toggleEmailSelection,
    toggleAllEmails,
    openEmail,
    setDeleteModalOpen,
    setArchiveModalOpen,
    setRestoreModalOpen,
    clearSelectedEmails,
    closeEmail,
  } = useEmailTableState()

  const {
    handleDeleteConfirm,
    handleArchiveConfirm,
    handleRestoreConfirm,
    toggleStar,
    toggleImportant,
    handleDeleteEmail,
    handleArchiveEmail,
    handleAgentAction,
    handleReply,
  } = useEmailTableActions()

  const { filterEmailsByFolder } = useEmailFilters()

  // Filtrer les emails selon le dossier
  const filteredEmails = filterEmailsByFolder(emails, folder)

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
    // Trouver l'email actuel dans le cache pour avoir les données à jour
    const currentEmail = emails.find(e => e.id === selectedEmail.id) || selectedEmail
    
    return (
      <div className="flex flex-col w-full h-full bg-white">
        <EmailDetailHeader
          selectedEmail={currentEmail}
          onClose={closeEmail}
          onToggleStar={() => toggleStar(currentEmail.id, filteredEmails)}
          onArchive={() => handleArchiveEmail(currentEmail.id, closeEmail)}
          onDelete={() => handleDeleteEmail(currentEmail.id, closeEmail)}
          onToggleImportant={() => toggleImportant(currentEmail.id, filteredEmails)}
          onAgentAction={(agent) => handleAgentAction(currentEmail.id, agent)}
        />
        <EmailDetailContent
          selectedEmail={currentEmail}
          onToggleStar={() => toggleStar(currentEmail.id, filteredEmails)}
          onReply={() => handleReply(currentEmail)}
          onToggleImportant={() => toggleImportant(currentEmail.id, filteredEmails)}
        />
      </div>
    )
  }

  return (
    <>
      <EmailListView
        filteredEmails={filteredEmails}
        folder={folder}
        refreshEmails={refreshEmails}
        selectedEmails={selectedEmails}
        hoveredEmail={hoveredEmail}
        setHoveredEmail={setHoveredEmail}
        toggleEmailSelection={toggleEmailSelection}
        toggleAllEmails={toggleAllEmails}
        openEmail={openEmail}
        onArchive={() => setArchiveModalOpen(true)}
        onDelete={() => setDeleteModalOpen(true)}
        onRestore={() => setRestoreModalOpen(true)}
      />
      
      <EmailModals
        deleteModalOpen={deleteModalOpen}
        archiveModalOpen={archiveModalOpen}
        restoreModalOpen={restoreModalOpen}
        selectedEmailsCount={selectedEmails.length}
        folder={folder}
        onCloseDelete={() => setDeleteModalOpen(false)}
        onCloseArchive={() => setArchiveModalOpen(false)}
        onCloseRestore={() => setRestoreModalOpen(false)}
        onConfirmDelete={() => handleDeleteConfirm(selectedEmails, () => {
          clearSelectedEmails()
          setDeleteModalOpen(false)
        })}
        onConfirmArchive={() => handleArchiveConfirm(selectedEmails, () => {
          clearSelectedEmails()
          setArchiveModalOpen(false)
        })}
        onConfirmRestore={() => handleRestoreConfirm(selectedEmails, () => {
          clearSelectedEmails()
          setRestoreModalOpen(false)
        })}
      />
    </>
  )
}
