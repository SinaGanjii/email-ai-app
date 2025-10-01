"use client"

import { useState, useEffect, useRef } from "react"

export interface SidebarState {
  sidebarOpen: boolean
  sidebarHovered: boolean
  overlayVisible: boolean
  overlayAnimating: boolean
  isInitialized: boolean
  isNavigating: boolean
  mobileMenuOpen: boolean
  composeModalOpen: boolean
}

export interface SidebarActions {
  setSidebarOpen: (open: boolean) => void
  setSidebarHovered: (hovered: boolean) => void
  setOverlayVisible: (visible: boolean) => void
  setOverlayAnimating: (animating: boolean) => void
  setIsNavigating: (navigating: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setComposeModalOpen: (open: boolean) => void
  resetOverlay: () => void
  handleEnter: () => void
  handleLeave: () => void
  handleNavigationClick: () => void
}

export function useSidebarState() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [overlayAnimating, setOverlayAnimating] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [composeModalOpen, setComposeModalOpen] = useState(false)
  
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open")
    if (saved !== null) {
      setSidebarOpen(JSON.parse(saved))
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("sidebar-open", JSON.stringify(sidebarOpen))
    }
  }, [sidebarOpen, isInitialized])

  useEffect(() => {
    if (sidebarOpen) {
      resetOverlay()
    }
  }, [sidebarOpen])

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
    setMobileMenuOpen(false)
    
    if (!sidebarOpen && window.innerWidth >= 768) {
      setIsNavigating(true) // freeze sidebar until navigation is done
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current)
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)

      if (!overlayVisible) {
        setSidebarHovered(true)
        setOverlayVisible(true)
        setOverlayAnimating(false)
      }
    }
  }

  const state: SidebarState = {
    sidebarOpen,
    sidebarHovered,
    overlayVisible,
    overlayAnimating,
    isInitialized,
    isNavigating,
    mobileMenuOpen,
    composeModalOpen,
  }

  const actions: SidebarActions = {
    setSidebarOpen,
    setSidebarHovered,
    setOverlayVisible,
    setOverlayAnimating,
    setIsNavigating,
    setMobileMenuOpen,
    setComposeModalOpen,
    resetOverlay,
    handleEnter,
    handleLeave,
    handleNavigationClick,
  }

  return { state, actions }
}
