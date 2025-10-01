"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, X, Loader2, ArrowLeft } from "lucide-react"
import { useEmailActions } from "@/hooks/useEmailActions"

export default function ComposePage() {
  const router = useRouter()
  const { replyEmail, sendEmail, loading } = useEmailActions()
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    body: '',
    cc: '',
    bcc: ''
  })
  const [originalEmailId, setOriginalEmailId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReply, setIsReply] = useState(false)

  useEffect(() => {
    const replyData = sessionStorage.getItem('replyEmail')
    if (replyData) {
      try {
        const parsed = JSON.parse(replyData)
        setFormData({
          to: parsed.to || '',
          subject: parsed.subject || '',
          body: parsed.originalBody ? `\n\n--- Message original ---\n${parsed.originalBody}` : '',
          cc: '',
          bcc: ''
        })
        setOriginalEmailId(parsed.originalEmailId)
        setIsReply(true)
        sessionStorage.removeItem('replyEmail')
      } catch (error) {
        console.error('Erreur lors du parsing des données de réponse:', error)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.to || !formData.subject || !formData.body) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (isReply && originalEmailId) {
      const result = await replyEmail({
        to: formData.to,
        subject: formData.subject,
        body: formData.body,
        originalEmailId: originalEmailId
      }, {
        onSuccess: () => {
          router.back()
        },
        onError: (error) => {
          setError(error)
        }
      })
    } else {
      const result = await sendEmail({
        to: formData.to,
        subject: formData.subject,
        body: formData.body,
        cc: formData.cc,
        bcc: formData.bcc
      }, {
        onSuccess: () => {
          router.back()
        },
        onError: (error) => {
          setError(error)
        }
      })
    }
  }

  const handleClose = () => {
    router.back()
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <h1 className="text-lg font-semibold">
            {isReply ? 'Répondre' : 'Nouvel email'}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="to">À *</Label>
                <Input
                  id="to"
                  type="email"
                  value={formData.to}
                  onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="destinataire@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cc">Cc</Label>
                <Input
                  id="cc"
                  type="email"
                  value={formData.cc}
                  onChange={(e) => setFormData(prev => ({ ...prev, cc: e.target.value }))}
                  placeholder="cc@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bcc">Cci</Label>
                <Input
                  id="bcc"
                  type="email"
                  value={formData.bcc}
                  onChange={(e) => setFormData(prev => ({ ...prev, bcc: e.target.value }))}
                  placeholder="cci@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Objet *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Objet de l'email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Tapez votre message ici..."
                  rows={12}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {isReply ? 'Envoyer la réponse' : 'Envoyer'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
