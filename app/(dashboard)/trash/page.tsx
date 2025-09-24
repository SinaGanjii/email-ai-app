"use client"
import { Trash2 } from "lucide-react"
import { EmailTable } from "@/components/dashboard/email-table-generic"

export default function TrashPage() {
  return (
    <EmailTable 
      folder="trash" 
      title="Trash" 
      icon={Trash2} 
      iconColor="text-red-500" 
    />
  )
}
