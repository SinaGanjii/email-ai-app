"use client"
import { Send } from "lucide-react"
import { EmailTable } from "@/components/dashboard/email-table"

export default function SentPage() {
  return (
    <EmailTable 
      folder="sent" 
      title="Sent" 
    />
  )
}
