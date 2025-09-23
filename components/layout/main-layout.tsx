"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, Mail, MessageSquare, User, Search, Inbox, Star, Clock, Send, Archive, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  const navigation = [
    { name: "Inbox", href: "/dashboard", icon: Inbox, count: 23 },
    { name: "Starred", href: "/starred", icon: Star },
    { name: "Snoozed", href: "/snoozed", icon: Clock },
    { name: "Sent", href: "/sent", icon: Send },
    { name: "Archive", href: "/archive", icon: Archive },
    { name: "Trash", href: "/trash", icon: Trash2 },
  ]

  const aiNavigation = [{ name: "AI Agents", href: "/agents", icon: MessageSquare }]

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">EmailAI</h1>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search mail"
                className="w-full rounded-full bg-input px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn("bg-card border-r border-border transition-all duration-300", sidebarOpen ? "w-64" : "w-16")}
        >
          <div className="p-4">
            <Button className="w-full justify-start gap-2 mb-6">
              <Plus className="h-4 w-4" />
              {sidebarOpen && "Compose"}
            </Button>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn("w-full justify-start gap-3 h-8", !sidebarOpen && "justify-center px-2")}
                    >
                      <Icon className="h-4 w-4" />
                      {sidebarOpen && (
                        <>
                          <span className="text-sm flex-1 text-left">{item.name}</span>
                          {item.count && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              {item.count}
                            </span>
                          )}
                        </>
                      )}
                    </Button>
                  </Link>
                )
              })}

              {sidebarOpen && (
                <div className="pt-4 mt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2 px-3">AI TOOLS</p>
                  {aiNavigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.name} href={item.href}>
                        <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-8">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{item.name}</span>
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
