"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

export interface SyncedEmail {
  id: string
  subject: string
  from_email: string
  from_name: string
  to_emails: string[]
  body: string | null
  body_html: string | null
  is_read: boolean
  is_starred: boolean
  is_important: boolean
  is_sent: boolean
  is_archived: boolean
  is_deleted: boolean
  is_in_trash: boolean
  sent_at: string | null
  received_at: string
}

interface EmailCacheContextType {
  emails: SyncedEmail[]
  loading: boolean
  error: string | null
  lastFetch: number | null
  fetchEmails: () => Promise<void>
  refreshEmails: () => Promise<void>
  updateEmail: (emailId: string, updates: Partial<SyncedEmail>) => void
  deleteEmail: (emailId: string) => void
  deleteEmails: (emailIds: string[]) => void
  archiveEmails: (emailIds: string[]) => void
  starEmails: (emailIds: string[]) => void
  markAsRead: (emailIds: string[]) => void
  restoreEmails: (emailIds: string[]) => void
}

const EmailCacheContext = createContext<EmailCacheContextType | undefined>(undefined)

export function EmailCacheProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const [emails, setEmails] = useState<SyncedEmail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number | null>(null)

  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setEmails([])
      setLastFetch(null)
      setError(null)
    }
  }, [isAuthenticated, user])

  const fetchEmails = async (forceRefresh = false) => {
    if (!isAuthenticated || !user) {
      console.warn('Cannot fetch emails: user not authenticated')
      return
    }

    const now = Date.now()
    
    if (!forceRefresh && lastFetch && (now - lastFetch) < CACHE_DURATION && emails.length > 0) {
      console.log('Using cached emails for user:', user.id)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/emails')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setEmails(data.emails || [])
        setLastFetch(now)
        console.log('Emails fetched and cached for user:', user.id)
      } else {
        const errorMsg = data.error || 'Unknown error'
        console.error('Error fetching emails:', errorMsg)
        setError(errorMsg)
        setEmails([])
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error'
      console.error('Error fetching emails:', errorMsg)
      setError(errorMsg)
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  const refreshEmails = async () => {
    await fetchEmails(true) // Force refresh
  }

  const updateEmail = (emailId: string, updates: Partial<SyncedEmail>) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, ...updates } : email
    ))
  }

  const deleteEmail = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId 
        ? { ...email, is_in_trash: true, is_deleted: false }
        : email
    ))
  }

  const deleteEmails = (emailIds: string[]) => {
    setEmails(prev => prev.map(email => 
      emailIds.includes(email.id)
        ? { ...email, is_in_trash: true, is_deleted: false }
        : email
    ))
  }

  const archiveEmails = (emailIds: string[]) => {
    setEmails(prev => prev.map(email => 
      emailIds.includes(email.id) 
        ? { ...email, is_archived: true }
        : email
    ))
  }

  const starEmails = (emailIds: string[]) => {
    setEmails(prev => prev.map(email => 
      emailIds.includes(email.id) 
        ? { ...email, is_starred: !email.is_starred }
        : email
    ))
  }

  const markAsRead = (emailIds: string[]) => {
    setEmails(prev => prev.map(email => 
      emailIds.includes(email.id) 
        ? { ...email, is_read: true }
        : email
    ))
  }

  const restoreEmails = (emailIds: string[]) => {
    setEmails(prev => prev.map(email => 
      emailIds.includes(email.id) 
        ? { ...email, is_in_trash: false, is_deleted: false }
        : email
    ))
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEmails(true)
    }
  }, [isAuthenticated, user])

  const value: EmailCacheContextType = {
    emails,
    loading,
    error,
    lastFetch,
    fetchEmails,
    refreshEmails,
    updateEmail,
    deleteEmail,
    deleteEmails,
    archiveEmails,
    starEmails,
    markAsRead,
    restoreEmails
  }

  return React.createElement(
    EmailCacheContext.Provider,
    { value },
    children
  )
}

export function useEmailCache() {
  const context = useContext(EmailCacheContext)
  if (context === undefined) {
    throw new Error('useEmailCache must be used within an EmailCacheProvider')
  }
  return context
}