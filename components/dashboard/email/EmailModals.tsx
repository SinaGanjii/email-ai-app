"use client"

import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { AlertTriangle, Archive, RotateCcw } from "lucide-react"

interface EmailModalsProps {
  deleteModalOpen: boolean
  archiveModalOpen: boolean
  restoreModalOpen: boolean
  selectedEmailsCount: number
  folder: string
  onCloseDelete: () => void
  onCloseArchive: () => void
  onCloseRestore: () => void
  onConfirmDelete: () => void
  onConfirmArchive: () => void
  onConfirmRestore: () => void
}

export function EmailModals({
  deleteModalOpen,
  archiveModalOpen,
  restoreModalOpen,
  selectedEmailsCount,
  folder,
  onCloseDelete,
  onCloseArchive,
  onCloseRestore,
  onConfirmDelete,
  onConfirmArchive,
  onConfirmRestore,
}: EmailModalsProps) {
  return (
    <>
      <Modal
        isOpen={deleteModalOpen}
        onClose={onCloseDelete}
        title={folder === 'trash' ? "Delete Forever" : "Delete Emails"}
        footer={
          <>
            <Button variant="outline" onClick={onCloseDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirmDelete}>
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
                ? `Are you sure you want to permanently delete ${selectedEmailsCount} email${selectedEmailsCount > 1 ? "s" : ""}?`
                : `Are you sure you want to delete ${selectedEmailsCount} email${selectedEmailsCount > 1 ? "s" : ""}?`
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
        onClose={onCloseArchive}
        title="Archive Emails"
        footer={
          <>
            <Button variant="outline" onClick={onCloseArchive}>
              Cancel
            </Button>
            <Button onClick={onConfirmArchive}>Archive</Button>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <Archive className="h-5 w-5 text-primary" />
          <div>
            <p className="text-foreground">
              Archive {selectedEmailsCount} email{selectedEmailsCount > 1 ? "s" : ""}?
            </p>
            <p className="text-sm text-muted-foreground mt-1">You can find archived emails in your archive folder.</p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={restoreModalOpen}
        onClose={onCloseRestore}
        title="Restore Emails"
        footer={
          <>
            <Button variant="outline" onClick={onCloseRestore}>
              Cancel
            </Button>
            <Button onClick={onConfirmRestore}>
              Restore
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <RotateCcw className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-foreground">
              Restore {selectedEmailsCount} email{selectedEmailsCount > 1 ? "s" : ""} to inbox?
            </p>
            <p className="text-sm text-muted-foreground mt-1">Emails will be moved back to your inbox.</p>
          </div>
        </div>
      </Modal>
    </>
  )
}
