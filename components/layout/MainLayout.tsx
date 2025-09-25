"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { SendEmailModal } from "@/components/email/send-email-modal"
import { Header } from "./Header"
import { SidebarManager } from "./SidebarManager"
import { useSidebarState } from "@/hooks/useSidebarState"
import { useEmailSync } from "@/hooks/useEmailSync"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { state, actions } = useSidebarState()
  const { syncing, syncEmails } = useEmailSync()
  const pathname = usePathname()
  const previousPathnameRef = useRef<string>(pathname)

  // When pathname changes, reset navigation freeze
  useEffect(() => {
    if (pathname !== previousPathnameRef.current) {
      previousPathnameRef.current = pathname
      
      if (state.isNavigating) {
        // Only reset isNavigating flag, don't interfere with overlay state
        actions.setIsNavigating(false)
      }
    }
  }, [pathname, state.isNavigating, actions])

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      actions.setMobileMenuOpen(!state.mobileMenuOpen)
    } else {
      actions.setSidebarOpen(!state.sidebarOpen)
    }
  }

  const handleComposeClick = () => {
    actions.setComposeModalOpen(true)
  }

  return (
    <div className="h-screen bg-background w-full overflow-hidden flex flex-col">
      <Header
        onMenuClick={handleMenuClick}
        syncing={syncing}
        onSyncClick={syncEmails}
      />

      <div className="flex flex-1 overflow-hidden relative min-h-0">
        <SidebarManager
          state={state}
          actions={actions}
          onComposeClick={handleComposeClick}
        />

        <main className="flex-1 min-w-0 overflow-auto transition-all duration-300">
          {children}
        </main>
      </div>

      <SendEmailModal 
        isOpen={state.composeModalOpen} 
        onClose={() => actions.setComposeModalOpen(false)} 
      />
    </div>
  )
}
