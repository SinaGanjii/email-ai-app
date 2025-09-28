"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Archive, Trash2, Star, Reply, Sparkles, MessageSquare, FileText } from "lucide-react"
import { useEmailFilters } from "@/hooks/email/useEmailFilters"
import { useState, useRef, useEffect } from "react"

interface EmailDetailHeaderProps {
  selectedEmail: any
  onClose: () => void
  onToggleStar: () => void
  onArchive: () => void
  onDelete: () => void
  onToggleImportant: () => void
  onAgentAction: (agent: string) => void
}

export function EmailDetailHeader({ selectedEmail, onClose, onToggleStar, onArchive, onDelete, onToggleImportant, onAgentAction }: EmailDetailHeaderProps) {
  const { formatDate } = useEmailFilters()

  return (
    <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-purple-500/10 transition-colors"
            onClick={() => onAgentAction("cleanup")}
            title="Cleanup Agent"
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-500/10 transition-colors"
            onClick={() => onAgentAction("smart-reply")}
            title="Smart Reply Agent"
          >
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-green-500/10 transition-colors"
            onClick={() => onAgentAction("summary")}
            title="Summary Agent"
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-orange-500/10 transition-colors"
            onClick={onArchive}
            title="Archiver"
          >
            <Archive className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-500/10 transition-colors"
            onClick={onDelete}
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
        <span className="hidden sm:inline">1 sur 1</span>
      </div>
    </div>
  )
}

interface EmailDetailContentProps {
  selectedEmail: any
  onToggleStar: () => void
  onReply: () => void
  onToggleImportant: () => void
}

export function EmailDetailContent({ selectedEmail, onToggleStar, onReply, onToggleImportant }: EmailDetailContentProps) {
  const { formatDate, getEmailDisplayName, cleanHtmlContent } = useEmailFilters()
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [showOriginalEmail, setShowOriginalEmail] = useState(false)
  const [replyText, setReplyText] = useState('')
  const replyBoxRef = useRef<HTMLDivElement>(null)

  // Scroll vers la boîte de réponse quand elle s'ouvre
  useEffect(() => {
    if (showReplyBox && replyBoxRef.current) {
      setTimeout(() => {
        replyBoxRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 100)
    }
  }, [showReplyBox])

  return (
    <>
      {/* Subject Line - Clean and Minimal */}
      <div className="px-3 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-2xl font-normal text-gray-900 flex-1">
            {selectedEmail.subject || '(Sans objet)'}
          </h1>
          <button
            onClick={onToggleImportant}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            title={selectedEmail.is_important ? "Marquer comme non important" : "Marquer comme important"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 24"
              className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${selectedEmail.is_important ? "fill-yellow-500" : "fill-gray-400"}`}
            >
              <path d="M4 4h13l8 8-8 8H4l8-8-8-8z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Email Content - Gmail Style Layout */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="px-3 sm:px-6 py-4">
          {/* Sender Info - Gmail Style Layout */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base flex-shrink-0">
                {getEmailDisplayName(selectedEmail).charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{getEmailDisplayName(selectedEmail)}</span>
                  <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">&lt;{selectedEmail.from_email}&gt;</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-gray-500 text-xs sm:text-sm">À moi</span>
                  <span className="text-gray-400 text-xs sm:text-sm">▼</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
                {formatDate(selectedEmail.sent_at || selectedEmail.received_at)}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onToggleStar}
                className={`p-1 ${selectedEmail.is_starred ? "text-yellow-500" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Star className={`h-3 w-3 sm:h-4 sm:w-4 ${selectedEmail.is_starred ? "fill-current" : ""}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={() => setShowReplyBox(!showReplyBox)}
                title="Répondre"
              >
                <Reply className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {/* Email Body - Clean Typography */}
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-800 leading-relaxed text-sm sm:text-base">
              {selectedEmail.body_html ? (
                <div 
                  className="email-content prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-a:text-blue-600 prose-strong:text-gray-900 prose-blockquote:text-gray-600 prose-img:rounded-lg prose-img:shadow-sm"
                  dangerouslySetInnerHTML={{ __html: cleanHtmlContent(selectedEmail.body_html) }}
                />
              ) : selectedEmail.body ? (
                <div className="whitespace-pre-wrap">
                  {selectedEmail.body}
                </div>
              ) : (
                <div className="text-gray-500 italic py-8 text-center">
                  Aucun contenu disponible. Le contenu complet de l'email sera disponible après la synchronisation complète avec Gmail.
                </div>
              )}
            </div>
          </div>

          {/* Reply Box - Gmail Style */}
          {showReplyBox && (
            <div ref={replyBoxRef} className="mt-6 border-t border-gray-200 pt-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Reply Header */}
                <div className="px-3 sm:px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Répondre à {getEmailDisplayName(selectedEmail)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOriginalEmail(!showOriginalEmail)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex-shrink-0"
                    >
                      <span className="hidden sm:inline">{showOriginalEmail ? 'Masquer' : 'Afficher'} le message original</span>
                      <span className="sm:hidden">{showOriginalEmail ? 'Masquer' : 'Afficher'}</span>
                    </Button>
                  </div>
                </div>

                {/* Original Email (Collapsible) */}
                {showOriginalEmail && (
                  <div className="px-3 sm:px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="text-xs text-gray-600 mb-2">Message original :</div>
                    <div className="text-xs sm:text-sm text-gray-700 max-h-32 overflow-y-auto">
                      {selectedEmail.body ? (
                        <div className="whitespace-pre-wrap">
                          {selectedEmail.body}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">
                          Contenu non disponible
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reply Text Area */}
                <div className="p-3 sm:p-4">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tapez votre réponse ici..."
                    rows={4}
                    className="border-0 resize-none focus:ring-0 text-xs sm:text-sm"
                  />
                </div>

                {/* Reply Actions */}
                <div className="px-3 sm:px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReplyBox(false)}
                        className="text-xs px-3 py-1"
                      >
                        Annuler
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setShowReplyBox(false)
                          setReplyText('')
                        }}
                        className="text-xs px-3 py-1"
                      >
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
