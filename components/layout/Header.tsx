"use client"

import { Button } from "@/components/ui/button"
import { Menu, Mail, Search, RefreshCw, Loader2 } from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
  syncing: boolean
  onSyncClick: () => void
}

export function Header({ onMenuClick, syncing, onSyncClick }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border w-full flex-shrink-0">
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-1 sm:p-2"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 sm:gap-2">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">
              EmailAI
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSyncClick}
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Sync...</span>
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sync Gmail</span>
              </>
            )}
          </Button>
        </div>
        <div className="flex-1 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-2 sm:mx-4 md:mx-6 lg:mx-8">
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search mail"
              className="w-full rounded-full bg-input px-6 sm:px-10 py-1.5 sm:py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
