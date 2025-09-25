"use client"

import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { NavigationMenu } from "./NavigationMenu"
import { SidebarState, SidebarActions } from "@/hooks/useSidebarState"

interface SidebarManagerProps {
  state: SidebarState
  actions: SidebarActions
  onComposeClick: () => void
}

export function SidebarManager({ state, actions, onComposeClick }: SidebarManagerProps) {
  const {
    sidebarOpen,
    overlayVisible,
    overlayAnimating,
    mobileMenuOpen,
  } = state

  const {
    handleEnter,
    handleLeave,
    handleNavigationClick,
  } = actions

  return (
    <>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => actions.setMobileMenuOpen(false)}
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
            <NavigationMenu sidebarOpen={true} onNavigationClick={handleNavigationClick} />
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
            onClick={onComposeClick}
            className={cn(
              "w-full gap-2 mb-4 bg-gray-100 hover:bg-gray-200 text-gray-700 border rounded-lg transition-all duration-300 h-9",
              sidebarOpen ? "justify-start" : "justify-center px-2"
            )}
          >
            <Pencil className="h-4 w-4" />
            {sidebarOpen && "Compose"}
          </Button>
          <NavigationMenu sidebarOpen={sidebarOpen} onNavigationClick={handleNavigationClick} />
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
          <NavigationMenu sidebarOpen={true} onNavigationClick={handleNavigationClick} />
        </div>
      </aside>
    </>
  )
}
