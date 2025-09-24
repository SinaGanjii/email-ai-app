"use client"
import { Archive } from "lucide-react"
import { EmailTable } from "@/components/dashboard/email-table"

export default function ArchivePage() {
  return (
    <EmailTable 
      folder="archive" 
      title="Archive" 
    />
  )
}
