"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Modal } from "@/components/ui/modal"
import {
  Star,
  Archive,
  Trash2,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  FileText,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface Email {
  id: string
  sender: string
  subject: string
  time: string
  status: "read" | "unread" | "important"
  preview: string
  starred: boolean
}

const mockEmails: Email[] = [
  {
    id: "1",
    sender: "John Smith",
    subject:
      "Q4 Budget Review Meeting - Hi team, I'd like to schedule a meeting to review our Q4 budget and discuss upcoming projects",
    time: "2:30 PM",
    status: "unread",
    preview:
      "Hi team, I'd like to schedule a meeting to review our Q4 budget and discuss upcoming projects for next quarter.",
    starred: false,
  },
  {
    id: "2",
    sender: "Sarah Marketing",
    subject: "New Campaign Launch - The new campaign is ready to launch and I wanted to share the final details",
    time: "1:15 PM",
    status: "read",
    preview: "The new campaign is ready to launch and I wanted to share the final details with everyone on the team.",
    starred: true,
  },
  {
    id: "3",
    sender: "Mom",
    subject:
      "Weekend Plans - Hey honey, what are your plans for this weekend because we were thinking of having a family barbecue",
    time: "12:45 PM",
    status: "read",
    preview: "Hey honey, what are your plans for this weekend because we were thinking of having a family barbecue.",
    starred: false,
  },
  {
    id: "4",
    sender: "Store Deals",
    subject:
      "50% Off Everything - Limited Time! - Don't miss out on our biggest sale of the year with incredible discounts",
    time: "11:30 AM",
    status: "unread",
    preview: "Don't miss out on our biggest sale of the year with incredible discounts on all your favorite items.",
    starred: false,
  },
  {
    id: "5",
    sender: "Project Team",
    subject: "Project Milestone Completed - Great news everyone, we've successfully completed the first milestone",
    time: "10:20 AM",
    status: "important",
    preview:
      "Great news everyone, we've successfully completed the first milestone and are ahead of schedule for delivery.",
    starred: true,
  },
]

export function EmailTable() {
  const [emails, setEmails] = useState<Email[]>(mockEmails)
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [hoveredEmail, setHoveredEmail] = useState<string | null>(null)

  const toggleEmailSelection = (emailId: string) => {
    setSelectedEmails((prev) => (prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]))
  }

  const toggleAllEmails = () => {
    setSelectedEmails(selectedEmails.length === emails.length ? [] : emails.map((email) => email.id))
  }

  const toggleStar = (emailId: string) => {
    setEmails((prev) => prev.map((email) => (email.id === emailId ? { ...email, starred: !email.starred } : email)))
  }

  const handleDeleteConfirm = () => {
    setEmails((prev) => prev.filter((email) => !selectedEmails.includes(email.id)))
    setSelectedEmails([])
    setDeleteModalOpen(false)
  }

  const handleArchiveConfirm = () => {
    setEmails((prev) => prev.filter((email) => !selectedEmails.includes(email.id)))
    setSelectedEmails([])
    setArchiveModalOpen(false)
  }

  const handleDeleteEmail = (emailId: string) => {
    setEmails((prev) => prev.filter((email) => email.id !== emailId))
  }

  const handleArchiveEmail = (emailId: string) => {
    setEmails((prev) => prev.filter((email) => email.id !== emailId))
  }

  const handleAgentAction = (emailId: string, agent: string) => {
    console.log(`Using ${agent} agent on email ${emailId}`)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox checked={selectedEmails.length === emails.length} onCheckedChange={toggleAllEmails} />
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {selectedEmails.length > 0 && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setArchiveModalOpen(true)}>
                <Archive className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteModalOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            1-{emails.length} of {emails.length}
          </span>
          <Button variant="ghost" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="divide-y divide-border">
          {emails.map((email) => (
            <div
              key={email.id}
              className={`flex items-center px-4 py-2 cursor-pointer hover:shadow-sm transition-all duration-150 ${
                email.status === "unread" ? "bg-background font-medium" : "bg-background/50"
              } ${hoveredEmail === email.id ? "shadow-sm" : ""}`}
              onMouseEnter={() => setHoveredEmail(email.id)}
              onMouseLeave={() => setHoveredEmail(null)}
              style={{ height: "40px" }} // Fixed Gmail-style row height
            >
              <div className="flex items-center gap-3 w-16">
                <Checkbox
                  checked={selectedEmails.includes(email.id)}
                  onCheckedChange={() => toggleEmailSelection(email.id)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleStar(email.id)
                  }}
                >
                  <Star
                    className={`h-4 w-4 ${email.starred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                  />
                </Button>
              </div>

              <div className="w-48 flex-shrink-0">
                <span
                  className={`text-sm truncate ${email.status === "unread" ? "font-semibold text-foreground" : "text-foreground"}`}
                >
                  {email.sender}
                </span>
              </div>

              <div className="flex-1 min-w-0 px-4">
                <p
                  className={`text-sm truncate ${email.status === "unread" ? "font-medium text-foreground" : "text-muted-foreground"}`}
                >
                  {email.subject}
                </p>
              </div>

              <div className="flex items-center gap-2 w-32 justify-end">
                {hoveredEmail === email.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-purple-500/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAgentAction(email.id, "cleanup")
                      }}
                      title="Cleanup Agent"
                    >
                      <Sparkles className="h-3 w-3 text-purple-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-blue-500/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAgentAction(email.id, "smart-reply")
                      }}
                      title="Smart Reply Agent"
                    >
                      <MessageSquare className="h-3 w-3 text-blue-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-green-500/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAgentAction(email.id, "summary")
                      }}
                      title="Summary Agent"
                    >
                      <FileText className="h-3 w-3 text-green-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-orange-500/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArchiveEmail(email.id)
                      }}
                      title="Archive"
                    >
                      <Archive className="h-3 w-3 text-orange-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteEmail(email.id)
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">{email.time}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Emails"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <p className="text-foreground">
              Are you sure you want to delete {selectedEmails.length} email{selectedEmails.length > 1 ? "s" : ""}?
            </p>
            <p className="text-sm text-muted-foreground mt-1">This action cannot be undone.</p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        title="Archive Emails"
        footer={
          <>
            <Button variant="outline" onClick={() => setArchiveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleArchiveConfirm}>Archive</Button>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <Archive className="h-5 w-5 text-primary" />
          <div>
            <p className="text-foreground">
              Archive {selectedEmails.length} email{selectedEmails.length > 1 ? "s" : ""}?
            </p>
            <p className="text-sm text-muted-foreground mt-1">You can find archived emails in your archive folder.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
