"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { User, Mail, LogOut, Shield } from "lucide-react"

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      // Redirection immédiate pour éviter l'état intermédiaire
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setSigningOut(false)
    }
  }

  const getProviderName = (provider?: string | null) => {
    switch (provider) {
      case "google":
        return "Google"
      case "github":
        return "GitHub"
      case "email":
        return "Email"
      default:
        return "Unknown"
    }
  }

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  }

  if (loading || signingOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {signingOut ? "Signing out..." : "Loading profile..."}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Mobile Layout: Vertical Stack */}
        <div className="flex flex-col space-y-6 lg:hidden">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg bg-card border">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={user.avatar_url || ""} alt={user.full_name ?? "User"} />
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {getInitials(user.full_name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">
                {user.full_name || "User"}
              </h1>
              <Badge variant="secondary" className="gap-1">
                <User className="h-3 w-3" />
                {getProviderName(user.provider)}
              </Badge>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-4 p-6 rounded-lg bg-card border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Details
            </h2>
            <Separator />
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm break-all">{user.email || "Not provided"}</p>
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Sign Out Button */}
            <Button
              onClick={handleSignOut}
              disabled={signingOut}
              variant="destructive"
              className="w-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>

        {/* Desktop Layout: Two Column Grid */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left Column: Avatar and Basic Info */}
          <div className="flex flex-col items-center text-center space-y-6 p-8 rounded-lg bg-card border">
            <Avatar className="h-24 w-24 border-2 border-border">
              <AvatarImage src={user.avatar_url || ""} alt={user.full_name ?? "User"} />
              <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                {getInitials(user.full_name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold">
                {user.full_name || "User"}
              </h1>
              <Badge variant="secondary" className="gap-2 text-sm">
                <User className="h-4 w-4" />
                {getProviderName(user.provider)}
              </Badge>
            </div>
          </div>

          {/* Right Column: Account Details */}
          <div className="space-y-6 p-8 rounded-lg bg-card border">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Details
            </h2>
            <Separator />
            
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p className="text-sm break-all">{user.email || "Not provided"}</p>
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Sign Out Button */}
            <Button
              onClick={handleSignOut}
              disabled={signingOut}
              variant="destructive"
              className="w-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}