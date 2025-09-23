"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface Agent {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

const agents: Agent[] = [
  {
    id: "cleanup",
    name: "Cleanup Agent",
    icon: "🧹",
    description: "Spam detection and email cleanup",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  {
    id: "reply",
    name: "Smart Reply",
    icon: "✍️",
    description: "Generate intelligent email responses",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    id: "summary",
    name: "Summary Agent",
    icon: "📑",
    description: "Conversation summaries and insights",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  {
    id: "auto",
    name: "Auto Mode",
    icon: "🤖",
    description: "Intelligent agent selection",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
]

interface AgentSelectorProps {
  selectedAgent: string
  onAgentChange: (agentId: string) => void
}

export function AgentSelector({ selectedAgent, onAgentChange }: AgentSelectorProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">AI Agents</h3>
        {agents.map((agent) => (
          <Tooltip key={agent.id}>
            <TooltipTrigger asChild>
              <Button
                variant={selectedAgent === agent.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onAgentChange(agent.id)}
                className={`justify-start gap-3 h-12 ${selectedAgent === agent.id ? agent.color : ""}`}
              >
                <span className="text-lg">{agent.icon}</span>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{agent.name}</span>
                  {selectedAgent === agent.id && (
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{agent.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
