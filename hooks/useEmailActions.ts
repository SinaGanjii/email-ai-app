"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface EmailActionOptions {
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
}

export function useEmailActions() {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeAction = async (action: string, data: any, options?: EmailActionOptions) => {
    if (!isAuthenticated) {
      const errorMsg = 'Authentication required'
      setError(errorMsg)
      options?.onError?.(errorMsg)
      return { success: false, error: errorMsg }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/emails/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType: action,
          ...data
        })
      })

      const result = await response.json()

      if (result.success) {
        options?.onSuccess?.(result)
        return result
      } else {
        const errorMsg = result.error || 'Action failed'
        setError(errorMsg)
        options?.onError?.(errorMsg)
        return { success: false, error: errorMsg }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Network error'
      setError(errorMsg)
      options?.onError?.(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const deleteEmails = async (emailIds: string[], options?: EmailActionOptions) => {
    return executeAction('delete', { emailIds }, options)
  }

  const archiveEmails = async (emailIds: string[], options?: EmailActionOptions) => {
    return executeAction('archive', { emailIds }, options)
  }

  const starEmails = async (emailIds: string[], options?: EmailActionOptions) => {
    return executeAction('star', { emailIds }, options)
  }

  const markAsRead = async (emailIds: string[], options?: EmailActionOptions) => {
    return executeAction('mark_read', { emailIds }, options)
  }

  const sendEmail = async (emailData: {
    to: string
    subject: string
    body: string
    cc?: string
    bcc?: string
    replyTo?: string
  }, options?: EmailActionOptions) => {
    return executeAction('send', { emailData }, options)
  }

  const replyEmail = async (emailData: {
    to: string
    subject: string
    body: string
    originalEmailId: string
  }, options?: EmailActionOptions) => {
    return executeAction('reply', { emailData }, options)
  }

  const forwardEmail = async (emailData: {
    to: string
    subject: string
    body: string
    originalEmailId: string
  }, options?: EmailActionOptions) => {
    return executeAction('forward', { emailData }, options)
  }

  const restoreEmails = async (emailIds: string[], options?: EmailActionOptions) => {
    return executeAction('restore', { emailIds }, options)
  }

  return {
    loading,
    error,
    deleteEmails,
    archiveEmails,
    starEmails,
    markAsRead,
    sendEmail,
    replyEmail,
    forwardEmail,
    restoreEmails,
    clearError: () => setError(null)
  }
}
