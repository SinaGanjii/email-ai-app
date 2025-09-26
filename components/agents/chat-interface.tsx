"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"
import type { Agent } from "./agent-selector"
import { summarizeEmail, cleanEmailContent } from "@/lib/emailSummarizer"

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
  emailToSummarize?: {
    id: string
    subject: string
    body: string
    from: string
  }
}

export function ChatInterface({ selectedAgent, agents, emailToSummarize }: ChatInterfaceProps) {
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

  // Auto-summarize when email is provided and summary agent is selected
  useEffect(() => {
    console.log('🔍 Auto-summarize effect triggered:', { selectedAgent, emailToSummarize, messagesLength: messages.length })
    if (selectedAgent === "summary" && emailToSummarize && messages.length === 1) {
      console.log('📧 Starting auto-summarize for email:', emailToSummarize.subject)
      const autoMessage: Message = {
        id: Date.now().toString(),
        content: `Résumer cet email : "${emailToSummarize.subject}"`,
        sender: "user",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, autoMessage])
      // Déclencher automatiquement le résumé
      setTimeout(() => {
        console.log('🚀 Triggering auto-summarize...')
        handleSendMessage()
      }, 500)
    }
  }, [selectedAgent, emailToSummarize])

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

    try {
      let agentResponse: Message

      if (selectedAgent === "summary" && emailToSummarize) {
        console.log('🤖 Calling summarize API for email:', emailToSummarize.subject)
        // Appeler l'agent de résumé réel
        const cleanedContent = cleanEmailContent(emailToSummarize.body)
        console.log('📝 Cleaned content length:', cleanedContent.length)
        const result = await summarizeEmail(cleanedContent)
        console.log('📊 Summarize API result:', result)
        
        if (result.success) {
          agentResponse = {
            id: (Date.now() + 1).toString(),
            content: `📧 **Email :** ${emailToSummarize.subject}\n\n**De :** ${emailToSummarize.from}\n\n---\n\n**📝 RÉSUMÉ :**\n\n${result.summary}\n\n---`,
            sender: "agent",
            timestamp: new Date().toISOString(),
            agentType: selectedAgent,
          }
        } else {
          agentResponse = {
            id: (Date.now() + 1).toString(),
            content: `❌ Erreur lors du résumé : ${result.error}`,
            sender: "agent",
            timestamp: new Date().toISOString(),
            agentType: selectedAgent,
          }
        }
      } else {
        // Réponse simulée pour les autres agents
        agentResponse = {
          id: (Date.now() + 1).toString(),
          content: getAgentResponse(selectedAgent, inputValue),
          sender: "agent",
          timestamp: new Date().toISOString(),
          agentType: selectedAgent,
        }
      }

      setMessages((prev) => [...prev, agentResponse])
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "❌ Une erreur s'est produite. Veuillez réessayer.",
        sender: "agent",
        timestamp: new Date().toISOString(),
        agentType: selectedAgent,
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const getAgentResponse = (agentId: string, userInput: string): string => {
    const responses = {
      cleanup:
        "I've analyzed your request for email cleanup. I found several spam emails and promotional messages that can be safely removed. Would you like me to proceed with the cleanup?",
      reply:
        "I can help you craft a professional response. Based on the context, here's a suggested reply that maintains a professional tone while addressing all key points mentioned.",
      summary:
        "🚧 **Version MVP** - L'agent de résumé fonctionne uniquement avec l'icône de résumé 📝 dans la liste des emails. Pour l'instant, les messages directs ne sont pas pris en charge.",
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
