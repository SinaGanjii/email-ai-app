"use client"

import { EmailActions, EmailHoverActions } from "./EmailActions"
import { useEmailFilters } from "@/hooks/email/useEmailFilters"

interface EmailRowProps {
  email: any
  folder: string
  isHovered: boolean
  isSelected: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
  onToggleSelection: () => void
  onToggleStar: () => void
  onToggleImportant: () => void
  onAgentAction: (agent: string) => void
  onArchive: () => void
  onDelete: () => void
  onRestore: () => void
}

export function EmailRow({
  email,
  folder,
  isHovered,
  isSelected,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onToggleSelection,
  onToggleStar,
  onToggleImportant,
  onAgentAction,
  onArchive,
  onDelete,
  onRestore,
}: EmailRowProps) {
  const { getEmailStatus, getEmailDisplayName, formatDate } = useEmailFilters()

  return (
    <div
      className={`flex items-center px-2 sm:px-4 py-2 cursor-pointer hover:shadow-sm transition-all duration-150 min-w-0 ${
        getEmailStatus(email) === "unread" ? "bg-background font-medium" : "bg-background/50"
      } ${isHovered ? "shadow-sm" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{ height: "40px" }} // Fixed Gmail-style row height
    >
      <EmailActions
        email={email}
        folder={folder}
        isHovered={isHovered}
        isSelected={isSelected}
        onToggleSelection={onToggleSelection}
        onToggleStar={onToggleStar}
        onToggleImportant={onToggleImportant}
        onAgentAction={onAgentAction}
        onArchive={onArchive}
        onDelete={onDelete}
        onRestore={onRestore}
      />

      <div className="w-24 sm:w-40 md:w-48 flex-shrink-0 min-w-0 ml-4">
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
            {isHovered ? (
              <EmailHoverActions
                email={email}
                folder={folder}
                onToggleImportant={onToggleImportant}
                onAgentAction={onAgentAction}
                onArchive={onArchive}
                onDelete={onDelete}
                onRestore={onRestore}
              />
            ) : (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatDate(email.sent_at || email.received_at)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
