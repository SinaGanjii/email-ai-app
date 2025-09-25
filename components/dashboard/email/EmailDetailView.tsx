"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Archive, Trash2, Flag, Printer, MoreHorizontal, Star, Reply, MoreVertical } from "lucide-react"
import { useEmailFilters } from "@/hooks/email/useEmailFilters"

interface EmailDetailHeaderProps {
  selectedEmail: any
  onClose: () => void
  onToggleStar: () => void
}

export function EmailDetailHeader({ selectedEmail, onClose, onToggleStar }: EmailDetailHeaderProps) {
  const { formatDate } = useEmailFilters()

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
            <Archive className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
            <Trash2 className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
            <Flag className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>1 sur 1</span>
        <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
          <Printer className="h-5 w-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
    </div>
  )
}

interface EmailDetailContentProps {
  selectedEmail: any
  onToggleStar: () => void
}

export function EmailDetailContent({ selectedEmail, onToggleStar }: EmailDetailContentProps) {
  const { formatDate, getEmailDisplayName, cleanHtmlContent } = useEmailFilters()

  return (
    <>
      {/* Subject Line - Clean and Minimal */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h1 className="text-2xl font-normal text-gray-900 mb-2">
          {selectedEmail.subject || '(Sans objet)'}
        </h1>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            Boîte de réception
          </span>
          <span className="text-sm text-gray-500">
            {formatDate(selectedEmail.sent_at || selectedEmail.received_at)}
          </span>
        </div>
      </div>

      {/* Email Content - Gmail Style Layout */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="px-6 py-4">
          {/* Sender Info - Gmail Style Layout */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {getEmailDisplayName(selectedEmail).charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{getEmailDisplayName(selectedEmail)}</span>
                  <span className="text-gray-500 text-sm">&lt;{selectedEmail.from_email}&gt;</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-gray-500 text-sm">À moi</span>
                  <span className="text-gray-400 text-sm">▼</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {formatDate(selectedEmail.sent_at || selectedEmail.received_at)}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onToggleStar}
                className={`p-1 ${selectedEmail.is_starred ? "text-yellow-500" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Star className={`h-4 w-4 ${selectedEmail.is_starred ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-gray-600">
                <Reply className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Email Body - Clean Typography */}
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-800 leading-relaxed text-base">
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

          {/* Status Badges - Subtle */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
            {selectedEmail.is_starred && (
              <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full border border-yellow-200">
                ⭐ Favori
              </span>
            )}
            {!selectedEmail.is_read && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                Non lu
              </span>
            )}
            {selectedEmail.is_sent && (
              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                Envoyé
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
