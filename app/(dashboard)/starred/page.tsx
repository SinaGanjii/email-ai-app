"use client"
import { Star } from "lucide-react"
import { EmailTable } from "@/components/dashboard/email-table-generic"

export default function StarredPage() {
  return (
    <EmailTable 
      folder="starred" 
      title="Starred" 
      icon={Star} 
      iconColor="text-yellow-500" 
    />
  )
}
