"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/reset-password']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    // Ne pas rediriger pendant le chargement
    if (loading) return

    // Si c'est une route publique et que l'utilisateur est connecté, rediriger vers le dashboard
    if (isPublicRoute && isAuthenticated) {
      router.push('/dashboard')
      return
    }

    // Si l'authentification est requise et que l'utilisateur n'est pas connecté
    if (requireAuth && !isAuthenticated && !isPublicRoute) {
      console.log('User not authenticated, redirecting to login')
      router.push(redirectTo)
      return
    }
  }, [loading, isAuthenticated, isPublicRoute, requireAuth, redirectTo, router, pathname])

  // Afficher un loader pendant la vérification d'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Si l'authentification est requise et que l'utilisateur n'est pas connecté, ne rien afficher
  // (la redirection va se faire)
  if (requireAuth && !isAuthenticated && !isPublicRoute) {
    return null
  }

  // Si c'est une route publique et que l'utilisateur est connecté, ne rien afficher
  // (la redirection vers le dashboard va se faire)
  if (isPublicRoute && isAuthenticated) {
    return null
  }

  // Afficher le contenu protégé
  return <>{children}</>
}
