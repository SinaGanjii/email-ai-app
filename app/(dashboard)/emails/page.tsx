'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface SyncedEmail {
  id: string
  subject: string
  from_email: string
  from_name: string
  to_emails: string[]
  snippet: string
  is_read: boolean
  is_starred: boolean
  is_important: boolean
  is_sent: boolean
  sent_at: string | null
  received_at: string
  thread: {
    subject: string
    snippet: string
  }
}

interface SyncResult {
  success: boolean
  message: string
  syncedCount?: number
  totalFound?: number
  errors?: string[]
}

export default function EmailsPage() {
  const { user, isAuthenticated } = useAuth()
  const [emails, setEmails] = useState<SyncedEmail[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails()
    }
  }, [isAuthenticated])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/emails')
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails || [])
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncEmails = async () => {
    setSyncing(true)
    setSyncResult(null)
    
    try {
      const response = await fetch('/api/gmail/sync', {
        method: 'POST'
      })
      
      const result = await response.json()
      setSyncResult(result)
      
      if (result.success) {
        // Refresh emails after successful sync
        await fetchEmails()
      }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEmailDisplayName = (email: SyncedEmail) => {
    return email.from_name || email.from_email
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté pour voir vos emails.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mes Emails</h1>
            <p className="text-gray-600">
              Emails synchronisés depuis Gmail ({emails.length} messages)
            </p>
          </div>
          <Button 
            onClick={syncEmails} 
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Synchroniser avec Gmail
              </>
            )}
          </Button>
        </div>

        {/* Sync Result */}
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

        {/* Emails List */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Chargement des emails...</span>
            </CardContent>
          </Card>
        ) : emails.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun email trouvé</h3>
              <p className="text-gray-600 mb-4">
                Synchronisez vos emails avec Gmail pour commencer.
              </p>
              <Button onClick={syncEmails} disabled={syncing}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Synchroniser maintenant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <Card key={email.id} className={`hover:shadow-md transition-shadow ${!email.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-medium ${!email.is_read ? 'font-bold' : ''}`}>
                          {email.subject || '(Sans objet)'}
                        </h3>
                        <div className="flex gap-1">
                          {email.is_starred && (
                            <Badge variant="secondary" className="text-xs">⭐</Badge>
                          )}
                          {email.is_important && (
                            <Badge variant="destructive" className="text-xs">Important</Badge>
                          )}
                          {email.is_sent && (
                            <Badge variant="outline" className="text-xs">Envoyé</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">
                          {email.is_sent ? 'À:' : 'De:'} {getEmailDisplayName(email)}
                        </span>
                        {email.to_emails.length > 0 && !email.is_sent && (
                          <span className="ml-2">
                            À: {email.to_emails.join(', ')}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {email.snippet}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(email.sent_at || email.received_at)}
                        </div>
                        {!email.is_read && (
                          <Badge variant="outline" className="text-xs">Non lu</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
