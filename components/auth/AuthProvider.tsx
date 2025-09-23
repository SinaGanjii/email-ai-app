"use client"

import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialiser le hook useAuth pour écouter les changements d'authentification
  useAuth()

  return <>{children}</>
}
