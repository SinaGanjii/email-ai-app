"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser, type CleanUser } from '@/lib/supabaseClient'

interface AuthState {
  user: CleanUser | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })
  const router = useRouter()

  useEffect(() => {
    // Vérification initiale optimisée avec cache
    checkAuth()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Utiliser directement la session pour éviter l'appel API
            const rawUserMetaData = session.user.user_metadata || {}
            const appMetadata = session.user.app_metadata || {}
            
            const user: CleanUser = {
              id: session.user.id,
              email: session.user.email || null,
              full_name: rawUserMetaData.full_name || rawUserMetaData.name || null,
              avatar_url: rawUserMetaData.avatar_url || rawUserMetaData.picture || null,
              provider: appMetadata.provider || null
            }
            
            setAuthState({ user, loading: false, error: null })
          } catch (error: any) {
            if (error?.message !== 'Auth session missing!') {
              // Error getting user after sign in
            }
            setAuthState({ user: null, loading: false, error: null })
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthState({ user: null, loading: false, error: null })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          try {
            // Utiliser directement la session pour éviter l'appel API
            const rawUserMetaData = session.user.user_metadata || {}
            const appMetadata = session.user.app_metadata || {}
            
            const user: CleanUser = {
              id: session.user.id,
              email: session.user.email || null,
              full_name: rawUserMetaData.full_name || rawUserMetaData.name || null,
              avatar_url: rawUserMetaData.avatar_url || rawUserMetaData.picture || null,
              provider: appMetadata.provider || null
            }
            
            setAuthState({ user, loading: false, error: null })
          } catch (error: any) {
            if (error?.message !== 'Auth session missing!') {
              // Error refreshing user data
            }
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      // Optimisation : timeout pour éviter les blocages en local
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      )
      
      const sessionPromise = supabase.auth.getSession()
      
      const { data: { session }, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any
      
      if (error) {
        setAuthState({ user: null, loading: false, error: null })
        return
      }
      
      if (session?.user) {
        // Créer l'objet user directement depuis la session (plus rapide)
        const rawUserMetaData = session.user.user_metadata || {}
        const appMetadata = session.user.app_metadata || {}
        
        const user: CleanUser = {
          id: session.user.id,
          email: session.user.email || null,
          full_name: rawUserMetaData.full_name || rawUserMetaData.name || null,
          avatar_url: rawUserMetaData.avatar_url || rawUserMetaData.picture || null,
          provider: appMetadata.provider || null
        }
        
        setAuthState({ user, loading: false, error: null })
      } else {
        setAuthState({ user: null, loading: false, error: null })
      }
    } catch (error: any) {
      if (error?.message === 'Auth timeout') {
        // En cas de timeout, essayer de continuer avec l'état actuel
        setAuthState({ user: null, loading: false, error: null })
      } else if (error?.message !== 'Auth session missing!') {
        setAuthState({ user: null, loading: false, error: null })
      } else {
        setAuthState({ user: null, loading: false, error: null })
      }
    }
  }

  // Fonction pour forcer la vérification d'auth
  const refreshAuth = async () => {
    await checkAuth()
  }

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      await supabase.auth.signOut()
      setAuthState({ user: null, loading: false, error: null })
      // Redirection immédiate pour éviter les états intermédiaires
      router.push('/auth/login')
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to sign out' }))
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    signOut,
    checkAuth,
    refreshAuth
  }
}
