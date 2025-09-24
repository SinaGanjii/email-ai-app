"use client"
import { Send } from "lucide-react"
import { EmailTable } from "@/components/dashboard/email-table-generic"

export default function SentPage() {
  return (
    <EmailTable 
      folder="sent" 
      title="Sent" 
      icon={Send} 
      iconColor="text-green-500" 
    />
  )
}
