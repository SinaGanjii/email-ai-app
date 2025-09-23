"use client"
import { MoreVertical, Archive, Delete, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MainLayout } from "@/components/layout/main-layout"

const snoozedEmails = [
  {
    id: 1,
    sender: "Netflix",
    subject: "Your monthly subscription payment",
    time: "Tomorrow 9:00 AM",
    isRead: true,
    snoozeUntil: "Tomorrow 9:00 AM",
  },
  {
    id: 2,
    sender: "Bank Alert",
    subject: "Monthly statement is ready",
    time: "Monday 8:00 AM",
    isRead: false,
    snoozeUntil: "Monday 8:00 AM",
  },
]

export default function SnoozedPage() {
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
          <span className="text-sm text-gray-600 dark:text-gray-400">1-2 of 2</span>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-auto w-full">
        {snoozedEmails.map((email) => (
          <div
            key={email.id}
            className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group h-10"
          >
            <Checkbox />
            <Clock className="h-4 w-4 text-blue-500" />
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <span
                className={`font-medium text-sm w-32 truncate ${!email.isRead ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
              >
                {email.sender}
              </span>
              <span
                className={`flex-1 text-sm truncate ${!email.isRead ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
              >
                {email.subject}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-24 text-right group-hover:hidden">
              {email.snoozeUntil}
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
