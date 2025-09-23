"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/lib/supabaseClient"
import { Chrome } from "lucide-react"

interface GoogleLoginButtonProps {
  redirectTo?: string
}

export function GoogleLoginButton({ redirectTo = '/dashboard' }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle(redirectTo)
    } catch (error) {
      console.error("Google sign-in failed:", error)
      // You could add a toast notification here for better UX
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-10 sm:h-11 flex items-center justify-center gap-2 border-border hover:bg-muted/50"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <Chrome className="h-4 w-4" />
      {isLoading ? "Signing in..." : "Continue with Google"}
    </Button>
  )
}
