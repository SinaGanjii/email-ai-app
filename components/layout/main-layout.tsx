"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Menu,
  Mail,
  MessageSquare,
  User,
  Search,
  Inbox,
  Star,
  Clock,
  Send,
  Archive,
  Trash2,
  Pencil,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [overlayAnimating, setOverlayAnimating] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousPathnameRef = useRef<string>(pathname)

  // --- Initialize sidebar state from localStorage ---
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open")
    if (saved !== null) {
      setSidebarOpen(JSON.parse(saved))
    }
    setIsInitialized(true)
  }, [])

  // --- Save state to localStorage ---
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("sidebar-open", JSON.stringify(sidebarOpen))
    }
  }, [sidebarOpen, isInitialized])

  // --- Reset overlay when fully open ---
  useEffect(() => {
    if (sidebarOpen) {
      resetOverlay()
    }
  }, [sidebarOpen])

  // --- When pathname changes, reset navigation freeze ---
  useEffect(() => {
    if (pathname !== previousPathnameRef.current) {
      previousPathnameRef.current = pathname
      
      if (isNavigating) {
        // Only reset isNavigating flag, don't interfere with overlay state
        setIsNavigating(false)
      }
    }
  }, [pathname, isNavigating])

  // --- Cleanup timers on unmount ---
  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current)
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
    }
  }, [])

  const resetOverlay = () => {
    setSidebarHovered(false)
    setOverlayVisible(false)
    setOverlayAnimating(false)

    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current)
      enterTimeoutRef.current = null
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
  }

  // --- Hover handlers with Gmail-like delays (desktop only) ---
  const handleEnter = () => {
    if (!sidebarOpen && !isNavigating && window.innerWidth >= 768) {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current)
        leaveTimeoutRef.current = null
      }
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current)

      enterTimeoutRef.current = setTimeout(() => {
        setSidebarHovered(true)
        setOverlayVisible(true)
        setOverlayAnimating(false)
        enterTimeoutRef.current = null
      }, 250) // Gmail-like delay
    }
  }

  const handleLeave = () => {
    if (!sidebarOpen && !isNavigating && window.innerWidth >= 768) {
      if (enterTimeoutRef.current) {
        clearTimeout(enterTimeoutRef.current)
        enterTimeoutRef.current = null
      }
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)

      leaveTimeoutRef.current = setTimeout(() => {
        setOverlayAnimating(true)
        setTimeout(() => {
          resetOverlay()
        }, 300) // Animation duration
        leaveTimeoutRef.current = null
      }, 400) // Gmail-like delay
    }
  }

  const handleNavigationClick = () => {
    // Close mobile menu on navigation
    setMobileMenuOpen(false)
    
    if (!sidebarOpen && window.innerWidth >= 768) {
      setIsNavigating(true) // freeze sidebar until navigation is done
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current)
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)

      // Only show overlay if not already visible to prevent flicker
      if (!overlayVisible) {
        setSidebarHovered(true)
        setOverlayVisible(true)
        setOverlayAnimating(false)
      }
    }
    // If sidebar is open, don't interfere with navigation
  }

  // --- NavigationItem reusable ---
  const NavigationItem = ({
    item,
    isOverlay = false,
  }: {
    item: NavigationItem
    isOverlay?: boolean
  }) => {
    const Icon = item.icon
    const isActive = pathname === item.href

    return (
      <Link key={item.name} href={item.href} onClick={handleNavigationClick}>
        <Button
          variant="ghost"
          className={cn(
            "w-full gap-2 h-8 transition-all duration-300 hover:bg-gray-100 hover:text-gray-900 group rounded-lg",
            isOverlay
              ? "justify-start"
              : sidebarOpen
              ? "justify-start"
              : "justify-center px-2",
            isActive &&
              "bg-gray-200/90 text-gray-900 border-l-2 border-gray-400"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 transition-colors duration-300",
              isActive
                ? "text-gray-700"
                : "text-gray-500 group-hover:text-gray-700"
            )}
          />
          {(isOverlay || sidebarOpen) && (
            <>
              <span
                className={cn(
                  "text-xs flex-1 text-left transition-colors duration-300",
                  isActive
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 group-hover:text-gray-900"
                )}
              >
                {item.name}
              </span>
              {item.count && (
                <span className="text-xs bg-gray-300/80 text-gray-700 px-1.5 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </>
          )}
        </Button>
      </Link>
    )
  }

  // --- Navigation data ---
  const navigation: NavigationItem[] = [
    { name: "Inbox", href: "/dashboard", icon: Inbox, count: 23 },
    { name: "Starred", href: "/starred", icon: Star },
    { name: "Snoozed", href: "/snoozed", icon: Clock },
    { name: "Sent", href: "/sent", icon: Send },
    { name: "Archive", href: "/archive", icon: Archive },
    { name: "Trash", href: "/trash", icon: Trash2 },
  ]
  const aiNavigation: NavigationItem[] = [
    { name: "AI Agents", href: "/agents", icon: MessageSquare },
  ]
  const profileNavigation: NavigationItem[] = [
    { name: "Profile", href: "/profile", icon: User },
  ]

  return (
    <div className="h-screen bg-background w-full overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border w-full flex-shrink-0">
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileMenuOpen(!mobileMenuOpen)
                } else {
                  setSidebarOpen(!sidebarOpen)
                }
              }}
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

      <div className="flex flex-1 overflow-hidden relative min-h-0">
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Hover overlay (desktop only) */}
        {!sidebarOpen && overlayVisible && window.innerWidth >= 768 && (
          <div
            className={cn(
              "absolute top-0 left-0 w-64 h-full bg-gray-50/95 backdrop-blur-md border-r border-gray-200/50 z-50 shadow-lg rounded-r-xl transition-all duration-300 ease-in-out flex-shrink-0",
              overlayAnimating
                ? "opacity-0 -translate-x-2"
                : "opacity-100 translate-x-0"
            )}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            <div className="p-3">
              <Button className="w-full justify-start gap-2 mb-4 bg-gray-100 hover:bg-gray-200 text-gray-700 border rounded-lg h-9">
                <Pencil className="h-4 w-4" />
                Compose
              </Button>
              <nav className="space-y-0.5">
                {navigation.map((item) => (
                  <NavigationItem key={item.name} item={item} isOverlay />
                ))}
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1.5 px-3">
                    AI TOOLS
                  </p>
                  {aiNavigation.map((item) => (
                    <NavigationItem key={item.name} item={item} isOverlay />
                  ))}
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1.5 px-3">
                    ACCOUNT
                  </p>
                  {profileNavigation.map((item) => (
                    <NavigationItem key={item.name} item={item} isOverlay />
                  ))}
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Sidebar (desktop) */}
        <aside
          className={cn(
            "bg-gray-50/80 backdrop-blur-sm border-r border-gray-200/60 transition-all duration-300 shadow-sm relative h-full hidden md:block flex-shrink-0",
            sidebarOpen ? "w-64" : "w-20"
          )}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="p-3">
            <Button
              className={cn(
                "w-full gap-2 mb-4 bg-gray-100 hover:bg-gray-200 text-gray-700 border rounded-lg transition-all duration-300 h-9",
                sidebarOpen ? "justify-start" : "justify-center px-2"
              )}
            >
              <Pencil className="h-4 w-4" />
              {sidebarOpen && "Compose"}
            </Button>
            <nav className="space-y-0.5">
              {navigation.map((item) => (
                <NavigationItem key={item.name} item={item} />
              ))}
              <div className="pt-3 mt-3 border-t border-gray-200">
                {sidebarOpen && (
                  <p className="text-xs font-medium text-gray-500 mb-1.5 px-3">
                    AI TOOLS
                  </p>
                )}
                {aiNavigation.map((item) => (
                  <NavigationItem key={item.name} item={item} />
                ))}
              </div>
              <div className="pt-3 mt-3 border-t border-gray-200">
                {sidebarOpen && (
                  <p className="text-xs font-medium text-gray-500 mb-1.5 px-3">
                    ACCOUNT
                  </p>
                )}
                {profileNavigation.map((item) => (
                  <NavigationItem key={item.name} item={item} />
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        <aside
          className={cn(
            "fixed top-0 left-0 h-full w-64 bg-gray-50/95 backdrop-blur-md border-r border-gray-200/50 shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden flex-shrink-0",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-4">
            <Button
              className="w-full justify-start gap-2 mb-6 bg-gray-100 hover:bg-gray-200 text-gray-700 border rounded-lg"
            >
              <Pencil className="h-4 w-4" />
              Compose
            </Button>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <NavigationItem key={item.name} item={item} isOverlay />
              ))}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2 px-3">
                  AI TOOLS
                </p>
                {aiNavigation.map((item) => (
                  <NavigationItem key={item.name} item={item} isOverlay />
                ))}
              </div>
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2 px-3">
                  ACCOUNT
                </p>
                {profileNavigation.map((item) => (
                  <NavigationItem key={item.name} item={item} isOverlay />
                ))}
              </div>
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-hidden transition-all duration-300">{children}</main>
      </div>
    </div>
  )
}
