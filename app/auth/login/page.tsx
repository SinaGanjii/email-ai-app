"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/auth/auth-layout"
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"
import { Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Utiliser Supabase pour l'authentification
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error.message)
        // Vous pouvez ajouter un toast ou un message d'erreur ici
        alert(`Erreur de connexion: ${error.message}`)
        return
      }

      if (data.user) {
        console.log("Login successful:", data.user.email)
        // Redirection directe vers le dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Une erreur est survenue lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full h-10 sm:h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-10 sm:h-11 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="remember-me" className="ml-2 text-sm text-muted-foreground">
              Remember me
            </Label>
          </div>

          <Link href="/auth/reset-password" className="text-sm text-primary hover:text-primary/80">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full h-10 sm:h-11" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <GoogleLoginButton />

        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:text-primary/80">
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  )
}
