import type React from "react"
interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">EmailAI</h1>
          <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold text-foreground">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground px-4">{subtitle}</p>
        </div>

        <div className="bg-card p-4 sm:p-6 md:p-8 rounded-lg border border-border shadow-sm">{children}</div>
      </div>
    </div>
  )
}
