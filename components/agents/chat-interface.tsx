"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"
import type { Agent } from "./agent-selector"

interface Message {
  id: string
  content: string
  sender: "user" | "agent"
  timestamp: string
  agentType?: string
}

interface ChatInterfaceProps {
  selectedAgent: string
  agents: Agent[]
}

export function ChatInterface({ selectedAgent, agents }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI assistant. How can I help you with your emails today?",
      sender: "agent",
      timestamp: new Date().toISOString(),
      agentType: selectedAgent,
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentAgent = agents.find((agent) => agent.id === selectedAgent)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAgentResponse(selectedAgent, inputValue),
        sender: "agent",
        timestamp: new Date().toISOString(),
        agentType: selectedAgent,
      }
      setMessages((prev) => [...prev, agentResponse])
      setIsLoading(false)
    }, 1500)
  }

  const getAgentResponse = (agentId: string, userInput: string): string => {
    const responses = {
      cleanup:
        "I've analyzed your request for email cleanup. I found several spam emails and promotional messages that can be safely removed. Would you like me to proceed with the cleanup?",
      reply:
        "I can help you craft a professional response. Based on the context, here's a suggested reply that maintains a professional tone while addressing all key points mentioned.",
      summary:
        "I've reviewed the conversation thread and can provide a comprehensive summary. The main topics discussed include project updates, meeting schedules, and action items for the team.",
      auto: "I'm analyzing your request and will automatically select the best approach. Based on the content, I recommend using the Smart Reply agent for this task.",
    }
    return responses[agentId as keyof typeof responses] || "I'm here to help with your email management needs."
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentAgent?.icon}</span>
          <div>
            <h3 className="font-medium text-foreground">{currentAgent?.name}</h3>
            <p className="text-sm text-muted-foreground">{currentAgent?.description}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "agent" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm">
                    {agents.find((a) => a.id === message.agentType)?.icon || "🤖"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`max-w-[80%] ${message.sender === "user" ? "order-first" : ""}`}>
                <div
                  className={`rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-1">{formatTime(message.timestamp)}</p>
              </div>

              {message.sender === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm">You</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm">{currentAgent?.icon}</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${currentAgent?.name} anything...`}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="sm" className="px-3">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}
