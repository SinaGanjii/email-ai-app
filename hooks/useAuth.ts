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
    // Vérifier l'état d'authentification initial
    checkAuth()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const user = await getCurrentUser()
            setAuthState({ user, loading: false, error: null })
          } catch (error: any) {
            if (error?.message !== 'Auth session missing!') {
              console.error('Error getting user after sign in:', error)
            }
            setAuthState({ user: null, loading: false, error: null })
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthState({ user: null, loading: false, error: null })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          try {
            const user = await getCurrentUser()
            setAuthState({ user, loading: false, error: null })
          } catch (error: any) {
            if (error?.message !== 'Auth session missing!') {
              console.error('Error refreshing user data:', error)
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
      
      const user = await getCurrentUser()
      setAuthState({ user, loading: false, error: null })
    } catch (error: any) {
      // Ne pas logger les erreurs de session manquante (cas normal)
      if (error?.message !== 'Auth session missing!') {
        console.error('Error checking auth:', error)
      }
      setAuthState({ user: null, loading: false, error: null })
    }
  }

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      await supabase.auth.signOut()
      setAuthState({ user: null, loading: false, error: null })
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
      setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to sign out' }))
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    signOut,
    checkAuth
  }
}
