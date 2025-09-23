import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Centralized redirect path - easy to change later
const DEFAULT_REDIRECT_PATH = '/dashboard'

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${DEFAULT_REDIRECT_PATH}`
      }
    })

    if (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Google sign-in failed:', error)
    throw error
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
  } catch (error) {
    console.error('Sign out failed:', error)
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting current user:', error)
      throw error
    }
    return user
  } catch (error) {
    console.error('Get current user failed:', error)
    throw error
  }
}
