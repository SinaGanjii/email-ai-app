'use client'

import { useState } from 'react'
import { EmailTable } from "@/components/dashboard/email-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react"

interface SyncResult {
  success: boolean
  message: string
  syncedCount?: number
  totalFound?: number
  errors?: string[]
}

export default function DashboardPage() {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)

  const syncEmails = async () => {
    setSyncing(true)
    setSyncResult(null)
    
    try {
      const response = await fetch('/api/gmail/sync', {
        method: 'POST'
      })
      
      const result = await response.json()
      setSyncResult(result)
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Network error',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Gmail Sync Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <RefreshCw className="h-5 w-5" />
            Synchronisation Gmail
          </CardTitle>
          <CardDescription className="text-blue-600">
            Synchronisez vos emails depuis Gmail vers votre base de données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={syncEmails} 
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Synchronisation en cours...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Synchroniser avec Gmail
              </>
            )}
          </Button>

          {syncResult && (
            <Alert className={syncResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {syncResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={syncResult.success ? 'text-green-800' : 'text-red-800'}>
                  <strong>{syncResult.message}</strong>
                  {syncResult.syncedCount !== undefined && (
                    <span className="ml-2">
                      ({syncResult.syncedCount}/{syncResult.totalFound} messages synchronisés)
                    </span>
                  )}
                </AlertDescription>
              </div>
              {syncResult.errors && syncResult.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-700">
                  <strong>Erreurs:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {syncResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Email Table */}
      <EmailTable />
    </div>
  )
}
