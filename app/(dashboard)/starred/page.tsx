"use client"
import { Star } from "lucide-react"
import { EmailTable } from "@/components/dashboard/email-table"

export default function StarredPage() {
  return (
    <EmailTable 
      folder="starred" 
      title="Starred" 
    />
  )
}
