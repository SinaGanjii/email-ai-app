"use client"
import { Archive } from "lucide-react"
import { EmailTable } from "@/components/dashboard/email-table-generic"

export default function ArchivePage() {
  return (
    <EmailTable 
      folder="archive" 
      title="Archive" 
      icon={Archive} 
      iconColor="text-gray-500" 
    />
  )
}
