"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RefreshCw, MoreVertical, Archive, Trash2, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"

interface EmailListHeaderProps {
  selectedEmailsCount: number
  filteredEmailsCount: number
  folder: string
  allEmailsSelected: boolean
  onToggleAll: () => void
  onRefresh: () => void
  onArchive: () => void
  onDelete: () => void
  onRestore: () => void
}

export function EmailListHeader({
  selectedEmailsCount,
  filteredEmailsCount,
  folder,
  allEmailsSelected,
  onToggleAll,
  onRefresh,
  onArchive,
  onDelete,
  onRestore,
}: EmailListHeaderProps) {
  return (
    <div className="flex items-center justify-between p-2 sm:p-4 border-b border-border min-w-0 bg-card sticky top-0 z-10">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <Checkbox 
            checked={allEmailsSelected} 
            onCheckedChange={onToggleAll} 
            className="h-4 w-4" 
          />
          <Button variant="ghost" size="sm" className="p-1 sm:p-2" onClick={onRefresh}>
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 sm:p-2">
            <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {selectedEmailsCount > 0 && (
          <div className="flex items-center gap-1 sm:gap-2">
            {folder === 'trash' ? (
              <>
                <Button size="sm" variant="ghost" onClick={onRestore} className="p-1 sm:p-2">
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onDelete} className="p-1 sm:p-2">
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={onArchive} className="p-1 sm:p-2">
                  <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onDelete} className="p-1 sm:p-2">
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
        <span className="hidden sm:inline">
          1-{filteredEmailsCount} of {filteredEmailsCount}
        </span>
        <span className="sm:hidden">
          {filteredEmailsCount}
        </span>
        <Button variant="ghost" size="sm" disabled className="p-1 sm:p-2">
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button variant="ghost" size="sm" disabled className="p-1 sm:p-2">
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  )
}
