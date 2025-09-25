"use client"

import { EmailListHeader } from "./EmailListHeader"
import { EmailRow } from "./EmailRow"
import { useEmailTableActions } from "@/hooks/email/useEmailTableActions"

interface EmailListViewProps {
  filteredEmails: any[]
  folder: string
  refreshEmails: () => void
  selectedEmails: string[]
  hoveredEmail: string | null
  setHoveredEmail: (emailId: string | null) => void
  toggleEmailSelection: (emailId: string) => void
  toggleAllEmails: (emails: any[]) => void
  openEmail: (email: any) => void
  onArchive: () => void
  onDelete: () => void
  onRestore: () => void
}

export function EmailListView({ 
  filteredEmails, 
  folder, 
  refreshEmails,
  selectedEmails,
  hoveredEmail,
  setHoveredEmail,
  toggleEmailSelection,
  toggleAllEmails,
  openEmail,
  onArchive,
  onDelete,
  onRestore,
}: EmailListViewProps) {
  const {
    toggleStar,
    toggleImportant,
    handleDeleteEmail,
    handleArchiveEmail,
    handleRestoreEmail,
    handleAgentAction,
  } = useEmailTableActions()

  const allEmailsSelected = selectedEmails.length === filteredEmails.length

  return (
    <div className="flex flex-col w-full max-w-full">
      <EmailListHeader
        selectedEmailsCount={selectedEmails.length}
        filteredEmailsCount={filteredEmails.length}
        folder={folder}
        allEmailsSelected={allEmailsSelected}
        onToggleAll={() => toggleAllEmails(filteredEmails)}
        onRefresh={refreshEmails}
        onArchive={onArchive}
        onDelete={onDelete}
        onRestore={onRestore}
      />

      <div className="w-full">
        <div className="divide-y divide-border min-w-0">
          {filteredEmails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              folder={folder}
              isHovered={hoveredEmail === email.id}
              isSelected={selectedEmails.includes(email.id)}
              onMouseEnter={() => setHoveredEmail(email.id)}
              onMouseLeave={() => setHoveredEmail(null)}
              onClick={() => openEmail(email)}
              onToggleSelection={() => toggleEmailSelection(email.id)}
              onToggleStar={() => toggleStar(email.id, filteredEmails)}
              onToggleImportant={() => toggleImportant(email.id, filteredEmails)}
              onAgentAction={(agent) => handleAgentAction(email.id, agent)}
              onArchive={() => handleArchiveEmail(email.id)}
              onDelete={() => handleDeleteEmail(email.id)}
              onRestore={() => handleRestoreEmail(email.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
