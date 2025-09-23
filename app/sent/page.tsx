"use client"
import { MoreVertical, Archive, Delete, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MainLayout } from "@/components/layout/main-layout"

const sentEmails = [
  {
    id: 1,
    recipient: "john.doe@company.com",
    subject: "Re: Project proposal review",
    time: "1h",
    isRead: true,
  },
  {
    id: 2,
    recipient: "team@startup.com",
    subject: "Weekly team meeting notes",
    time: "3h",
    isRead: true,
  },
  {
    id: 3,
    recipient: "client@business.com",
    subject: "Invoice #2024-001",
    time: "1d",
    isRead: true,
  },
]

export default function SentPage() {
  return (
    <MainLayout>
      <div className="flex-1 flex flex-col h-full w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 min-w-0">
        <div className="flex items-center gap-4">
          <Checkbox />
          <Button variant="ghost" size="sm">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Delete className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">1-3 of 3</span>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-auto w-full">
        {sentEmails.map((email) => (
          <div
            key={email.id}
            className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group h-10"
          >
            <Checkbox />
            <Send className="h-4 w-4 text-green-500" />
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <span className="font-medium text-sm w-32 truncate text-gray-600 dark:text-gray-400">
                To: {email.recipient}
              </span>
              <span className="flex-1 text-sm truncate text-gray-600 dark:text-gray-400">{email.subject}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right group-hover:hidden">
              {email.time}
            </span>
            <div className="hidden group-hover:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Archive className="h-3 w-3" />
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
