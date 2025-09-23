"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Eye, EyeOff } from "lucide-react"

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
      // Simulate login process
      console.log("Login attempt:", { email, password })

      // For demo purposes, accept any email/password combination
      // In a real app, you would validate credentials here
      if (email && password) {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Store user session (in a real app, you'd use proper authentication)
        localStorage.setItem("user", JSON.stringify({ email, loggedIn: true }))

        // Redirect to dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
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
