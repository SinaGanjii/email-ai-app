"use client"
import { MoreVertical, Delete, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MainLayout } from "@/components/layout/main-layout"

const archivedEmails = [
  {
    id: 1,
    sender: "Old Newsletter",
    subject: "Monthly digest from last year",
    time: "3 months",
    isRead: true,
  },
  {
    id: 2,
    sender: "Conference 2023",
    subject: "Thank you for attending our event",
    time: "6 months",
    isRead: true,
  },
]

export default function ArchivePage() {
  return (
    <MainLayout>
      <div className="flex-1 flex flex-col h-full w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 min-w-0">
        <div className="flex items-center gap-4">
          <Checkbox />
          <Button variant="ghost" size="sm">
            <Delete className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">1-2 of 2</span>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-auto w-full">
        {archivedEmails.map((email) => (
          <div
            key={email.id}
            className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group h-10"
          >
            <Checkbox />
            <FolderOpen className="h-4 w-4 text-gray-500" />
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <span className="font-medium text-sm w-32 truncate text-gray-600 dark:text-gray-400">{email.sender}</span>
              <span className="flex-1 text-sm truncate text-gray-600 dark:text-gray-400">{email.subject}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right group-hover:hidden">
              {email.time}
            </span>
            <div className="hidden group-hover:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Delete className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </MainLayout>
  )
}
