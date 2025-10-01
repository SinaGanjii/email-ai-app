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
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
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
            }
            setAuthState({ user: null, loading: false, error: null })
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthState({ user: null, loading: false, error: null })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          try {
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
        setAuthState({ user: null, loading: false, error: null })
      } else if (error?.message !== 'Auth session missing!') {
        setAuthState({ user: null, loading: false, error: null })
      } else {
        setAuthState({ user: null, loading: false, error: null })
      }
    }
  }

  const refreshAuth = async () => {
    await checkAuth()
  }

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      await supabase.auth.signOut()
      setAuthState({ user: null, loading: false, error: null })
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
