"use client"

import { useState } from "react"

export function useEmailTableState() {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [hoveredEmail, setHoveredEmail] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null)

  const toggleEmailSelection = (emailId: string) => {
    setSelectedEmails((prev) => (prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]))
  }

  const toggleAllEmails = (filteredEmails: any[]) => {
    setSelectedEmails(selectedEmails.length === filteredEmails.length ? [] : filteredEmails.map((email) => email.id))
  }

  const clearSelectedEmails = () => {
    setSelectedEmails([])
  }

  const openEmail = (email: any) => {
    setSelectedEmail(email)
  }

  const closeEmail = () => {
    setSelectedEmail(null)
  }

  return {
    selectedEmails,
    deleteModalOpen,
    archiveModalOpen,
    restoreModalOpen,
    hoveredEmail,
    selectedEmail,
    
    setSelectedEmails,
    setDeleteModalOpen,
    setArchiveModalOpen,
    setRestoreModalOpen,
    setHoveredEmail,
    setSelectedEmail,
    toggleEmailSelection,
    toggleAllEmails,
    clearSelectedEmails,
    openEmail,
    closeEmail,
  }
}
