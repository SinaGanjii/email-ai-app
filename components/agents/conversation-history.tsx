"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare } from "lucide-react"

interface Conversation {
  id: string
  title: string
  agent: string
  timestamp: string
  messageCount: number
  preview: string
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Email Cleanup Session",
    agent: "cleanup",
    timestamp: "2024-01-15T10:30:00Z",
    messageCount: 12,
    preview: "Identified 23 spam emails and 5 promotional emails...",
  },
  {
    id: "2",
    title: "Reply to Client Meeting",
    agent: "reply",
    timestamp: "2024-01-15T09:15:00Z",
    messageCount: 8,
    preview: "Generated professional response for meeting request...",
  },
  {
    id: "3",
    title: "Weekly Email Summary",
    agent: "summary",
    timestamp: "2024-01-14T16:45:00Z",
    messageCount: 5,
    preview: "Summarized 47 emails from this week...",
  },
  {
    id: "4",
    title: "Auto Processing",
    agent: "auto",
    timestamp: "2024-01-14T14:20:00Z",
    messageCount: 15,
    preview: "Automatically processed incoming emails...",
  },
]

const agentColors = {
  cleanup: "bg-red-500/10 text-red-500",
  reply: "bg-blue-500/10 text-blue-500",
  summary: "bg-green-500/10 text-green-500",
  auto: "bg-purple-500/10 text-purple-500",
}

const agentIcons = {
  cleanup: "🧹",
  reply: "✍️",
  summary: "📑",
  auto: "🤖",
}

interface ConversationHistoryProps {
  selectedConversation: string | null
  onConversationSelect: (conversationId: string) => void
}

export function ConversationHistory({ selectedConversation, onConversationSelect }: ConversationHistoryProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">Conversation History</h3>
        <p className="text-xs text-muted-foreground">Recent AI interactions</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {mockConversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant={selectedConversation === conversation.id ? "secondary" : "ghost"}
              className="w-full h-auto p-3 justify-start"
              onClick={() => onConversationSelect(conversation.id)}
            >
              <div className="flex flex-col items-start gap-2 w-full">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-sm">{agentIcons[conversation.agent as keyof typeof agentIcons]}</span>
                  <span className="text-sm font-medium truncate flex-1">{conversation.title}</span>
                </div>

                <div className="flex items-center gap-2 w-full">
                  <Badge
                    variant="outline"
                    className={`text-xs ${agentColors[conversation.agent as keyof typeof agentColors]}`}
                  >
                    {conversation.agent}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {conversation.messageCount}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-left line-clamp-2">{conversation.preview}</p>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTime(conversation.timestamp)}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
