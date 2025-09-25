"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Inbox,
  Star,
  Clock,
  Send,
  Archive,
  Trash2,
  MessageSquare,
  User,
} from "lucide-react"

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

interface NavigationMenuProps {
  sidebarOpen: boolean
  onNavigationClick: () => void
}

export function NavigationMenu({ sidebarOpen, onNavigationClick }: NavigationMenuProps) {
  const pathname = usePathname()

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Inbox },
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
      <Link key={item.name} href={item.href} onClick={onNavigationClick}>
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

  return (
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
  )
}
