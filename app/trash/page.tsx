"use client"
import { MoreVertical, Delete, Trash2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MainLayout } from "@/components/layout/main-layout"

const trashedEmails = [
  {
    id: 1,
    sender: "Spam Email",
    subject: "You've won a million dollars!",
    time: "2d",
    isRead: true,
  },
  {
    id: 2,
    sender: "Old Promotion",
    subject: "50% off everything - limited time",
    time: "1w",
    isRead: true,
  },
]

export default function TrashPage() {
  return (
    <MainLayout>
      <div className="flex-1 flex flex-col h-full w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 min-w-0">
        <div className="flex items-center gap-4">
          <Checkbox />
          <Button variant="ghost" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
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
        {trashedEmails.map((email) => (
          <div
            key={email.id}
            className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group h-10"
          >
            <Checkbox />
            <Trash2 className="h-4 w-4 text-red-500" />
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <span className="font-medium text-sm w-32 truncate text-gray-600 dark:text-gray-400 line-through">
                {email.sender}
              </span>
              <span className="flex-1 text-sm truncate text-gray-600 dark:text-gray-400 line-through">
                {email.subject}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right group-hover:hidden">
              {email.time}
            </span>
            <div className="hidden group-hover:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <RotateCcw className="h-3 w-3" />
              </Button>
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
