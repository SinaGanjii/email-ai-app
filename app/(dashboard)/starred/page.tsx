"use client"

import { useState } from "react"
import { MoreVertical, Archive, Delete, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

const starredEmails = [
  {
    id: 1,
    sender: "GitHub",
    subject: "Your security alert - New sign-in from Chrome on Windows",
    time: "2h",
    isRead: false,
    isStarred: true,
  },
  {
    id: 2,
    sender: "Vercel",
    subject: "Your deployment is ready - project-name.vercel.app",
    time: "4h",
    isRead: true,
    isStarred: true,
  },
  {
    id: 3,
    sender: "OpenAI",
    subject: "ChatGPT Plus subscription renewal",
    time: "1d",
    isRead: true,
    isStarred: true,
  },
]

export default function StarredPage() {
  const [selectedEmails, setSelectedEmails] = useState<number[]>([])

  return (
    <div className="flex-1 flex flex-col h-full w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 min-w-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Checkbox />
          <Button variant="ghost" size="sm">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Delete className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-gray-600 dark:text-gray-400">1-3 of 3</span>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-auto w-full">
        {starredEmails.map((email) => (
          <div
            key={email.id}
            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group h-10 min-w-0"
          >
            <Checkbox className="flex-shrink-0" />
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
              <span
                className={`font-medium text-sm w-24 sm:w-32 truncate ${!email.isRead ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
              >
                {email.sender}
              </span>
              <span
                className={`flex-1 text-sm truncate ${!email.isRead ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
              >
                {email.subject}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 sm:w-12 text-right group-hover:hidden flex-shrink-0">
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
  )
}
