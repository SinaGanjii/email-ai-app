"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ChevronDown, Mic, Sparkles, Book as Broom, Reply, FileText } from "lucide-react"

const agents = [
  { id: "auto", name: "Auto", color: "text-purple-400", icon: Sparkles },
  { id: "cleanup", name: "Cleanup", color: "text-red-400", icon: Broom },
  { id: "reply", name: "Smart Reply", color: "text-blue-400", icon: Reply },
  { id: "summary", name: "Summary", color: "text-green-400", icon: FileText },
]

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  agent?: string
  timestamp: Date
}

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState("auto")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm the ${agents.find((a) => a.id === selectedAgent)?.name} agent. I've processed your message: "${userMessage.content}". How can I help you further?`,
        sender: "ai",
        agent: selectedAgent,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    // Simulate voice recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false)
        setMessage("Voice message transcribed: How can I help you today?")
      }, 2000)
    }
  }

  const selectedAgentData = agents.find((a) => a.id === selectedAgent)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-background">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {selectedAgentData && (
                    <selectedAgentData.icon className={`h-16 w-16 mx-auto ${selectedAgentData.color}`} />
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">AI Email Assistant</h2>
                <p className="text-muted-foreground">Choose an agent and start chatting to manage your emails</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {msg.sender === "ai" && (
                    <div
                      className={`text-xs ${agents.find((a) => a.id === msg.agent)?.color} mb-1 font-medium flex items-center gap-1`}
                    >
                      {(() => {
                        const agent = agents.find((a) => a.id === msg.agent)
                        const IconComponent = agent?.icon
                        return IconComponent ? <IconComponent className="h-3 w-3" /> : null
                      })()}
                      {agents.find((a) => a.id === msg.agent)?.name} Agent
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">AI is typing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 bg-muted rounded-3xl p-3 shadow-sm">
              {/* Agent Selector */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${selectedAgentData?.color} hover:bg-background/50 flex items-center gap-1`}
                >
                  {selectedAgentData && <selectedAgentData.icon className="h-3 w-3" />}
                  {selectedAgentData?.name}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>

                {isDropdownOpen && (
                  <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-10">
                    {agents.map((agent) => {
                      const IconComponent = agent.icon
                      return (
                        <button
                          key={agent.id}
                          onClick={() => {
                            setSelectedAgent(agent.id)
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors ${agent.color} ${
                            selectedAgent === agent.id ? "bg-muted" : ""
                          } flex items-center gap-2`}
                        >
                          <IconComponent className="h-3 w-3" />
                          {agent.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />

              {/* Voice Button */}
              <Button
                onClick={handleVoiceRecord}
                variant="ghost"
                size="sm"
                className={`rounded-full p-2 h-9 w-9 ${isRecording ? "bg-red-500 text-white animate-pulse" : "hover:bg-background/50"}`}
              >
                <Mic className="h-4 w-4" />
              </Button>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                size="sm"
                className="rounded-full p-2 h-9 w-9 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
  )
}
