import { MainLayout } from "@/components/layout/MainLayout"
import { EmailCacheProvider } from "@/hooks/useEmailCache"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EmailCacheProvider>
      <MainLayout>{children}</MainLayout>
    </EmailCacheProvider>
  )
}
