import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient({
  options: { db: { schema: 'mail' } }
})

// Centralized redirect path - easy to change later
export const DEFAULT_REDIRECT_PATH = '/dashboard'

// Clean user object type
export interface CleanUser {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  provider: string | null
}

export async function signInWithGoogle(redirectTo: string = DEFAULT_REDIRECT_PATH) {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('signInWithGoogle can only be called in browser environment')
    }

    const response = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send'
      }
    })

    if (response.error) {
      console.error('Error signing in with Google:', response.error)
      throw response.error
    }

    return response
  } catch (error) {
    console.error('Google sign-in failed:', error)
    throw error
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
    
    // Force redirect to login page on successful sign out (only in browser)
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  } catch (error) {
    console.error('Sign out failed:', error)
    throw error
  }
}

export async function getCurrentUser(): Promise<CleanUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Ne pas logger les erreurs de session manquante (cas normal)
      if (error.message !== 'Auth session missing!') {
        console.error('Error getting current user:', error)
      }
      return null
    }

    if (!user) {
      return null
    }

    // Extract user info from raw_user_meta_data and user_metadata
    const rawUserMetaData = user.user_metadata || {}
    const appMetadata = user.app_metadata || {}
    
    const cleanUser: CleanUser = {
      id: user.id,
      email: user.email || null,
      full_name: rawUserMetaData.full_name || rawUserMetaData.name || null,
      avatar_url: rawUserMetaData.avatar_url || rawUserMetaData.picture || null,
      provider: appMetadata.provider || null
    }

    return cleanUser
  } catch (error: any) {
    // Ne pas logger les erreurs de session manquante (cas normal)
    if (error?.message !== 'Auth session missing!') {
      console.error('Get current user failed:', error)
    }
    return null
  }
}

export async function getSessionInfo() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    if (!session) {
      return null
    }

    return {
      user: session.user,
      provider: session.user?.app_metadata?.provider,
      hasAccessToken: !!session.access_token,
      hasProviderToken: !!session.provider_token,
      hasProviderRefreshToken: !!session.provider_refresh_token,
      tokenExpiry: session.expires_at,
      scopes: session.user?.app_metadata?.provider_scopes || 'No scopes found'
    }
  } catch (error: any) {
    console.error('Get session info failed:', error)
    return null
  }
}
