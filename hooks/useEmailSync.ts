"use client"

import { useState } from "react"

export function useEmailSync() {
  const [syncing, setSyncing] = useState(false)

  const syncEmails = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/gmail/sync', {
        method: 'POST'
      })
      const result = await response.json()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  return {
    syncing,
    syncEmails,
  }
}
