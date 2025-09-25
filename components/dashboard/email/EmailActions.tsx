"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, Archive, Trash2, Sparkles, MessageSquare, FileText, RotateCcw, Triangle } from "lucide-react"

interface EmailActionsProps {
  email: any
  folder: string
  isHovered: boolean
  isSelected: boolean
  onToggleSelection: () => void
  onToggleStar: () => void
  onToggleImportant: () => void
  onAgentAction: (agent: string) => void
  onArchive: () => void
  onDelete: () => void
  onRestore: () => void
}

export function EmailActions({
  email,
  folder,
  isHovered,
  isSelected,
  onToggleSelection,
  onToggleStar,
  onToggleImportant,
  onAgentAction,
  onArchive,
  onDelete,
  onRestore,
}: EmailActionsProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 w-12 sm:w-14 flex-shrink-0">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggleSelection}
        className="h-4 w-4"
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 sm:h-5 sm:w-5 p-0"
        onClick={(e) => {
          e.stopPropagation()
          onToggleStar()
        }}
      >
        <Star
          className={`h-3 w-3 ${email.is_starred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
        />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 sm:h-5 sm:w-5 p-0"
        onClick={(e) => {
          e.stopPropagation()
          onToggleImportant()
        }}
      >
        <Triangle
          className={`h-3 w-3 rotate-90 ${email.is_important ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
        />
      </Button>
    </div>
  )
}

export function EmailHoverActions({
  email,
  folder,
  onAgentAction,
  onArchive,
  onDelete,
  onRestore,
}: Omit<EmailActionsProps, 'isHovered' | 'isSelected' | 'onToggleSelection' | 'onToggleStar'>) {
  if (folder === 'trash') {
    return (
      <div className="flex items-center gap-1 animate-in fade-in-0 duration-200">
        <Button
          size="sm"
          variant="ghost"
          className="h-5 w-5 p-0 hover:bg-green-500/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            onRestore()
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
            onDelete()
          }}
          title="Delete Forever"
        >
          <Trash2 className="h-3 w-3 text-red-500" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 animate-in fade-in-0 duration-200">
      <Button
        size="sm"
        variant="ghost"
        className="h-5 w-5 p-0 hover:bg-purple-500/10 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          onAgentAction("cleanup")
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
          onAgentAction("smart-reply")
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
          onAgentAction("summary")
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
          onArchive()
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
          onDelete()
        }}
        title="Delete"
      >
        <Trash2 className="h-3 w-3 text-red-500" />
      </Button>
    </div>
  )
}
