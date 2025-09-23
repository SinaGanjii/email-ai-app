import { createClient } from '@supabase/supabase-js'
import type { AuthResponse, User, OAuthResponse } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

export async function signInWithGoogle(): Promise<OAuthResponse> {
  try {
    const response = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${DEFAULT_REDIRECT_PATH}`
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
    
    // Force redirect to login page on successful sign out
    window.location.href = '/auth/login'
  } catch (error) {
    console.error('Sign out failed:', error)
    throw error
  }
}

export async function getCurrentUser(): Promise<CleanUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      throw error
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
  } catch (error) {
    console.error('Get current user failed:', error)
    throw error
  }
}
