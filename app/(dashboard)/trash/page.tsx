"use client"
import { Trash2 } from "lucide-react"
import { EmailTable } from "@/components/dashboard/email-table"

export default function TrashPage() {
  return (
    <EmailTable 
      folder="trash" 
      title="Trash" 
    />
  )
}
