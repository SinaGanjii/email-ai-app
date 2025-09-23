import { MainLayout } from "@/components/layout/main-layout"
import { EmailTable } from "@/components/dashboard/email-table"

export default function DashboardPage() {
  return (
    <MainLayout>
      <EmailTable />
    </MainLayout>
  )
}
