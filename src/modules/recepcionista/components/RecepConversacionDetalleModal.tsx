import { useEffect, useRef, useState } from 'react'
import type { EscalatedConversationListItem } from '../types/index.ts'
import { useRecepConversacionDetalle } from '../hooks/index.ts'
import { RecepChatMessageBubble } from './RecepChatMessageBubble'
import { RecepResolverEscalacionModal } from './RecepResolverEscalacionModal'
import { ChatIcon, UserAvatarIcon, ReloadIcon, CheckIcon } from '@/global/components'

interface RecepConversacionDetalleModalProps {
  conversation: EscalatedConversationListItem | null
  isOpen: boolean
  onClose: () => void
  onResolved?: (escalationId: string) => void
  onNotice?: (message: string) => void
  canSendMessages?: boolean
  canResolveEscalations?: boolean
}

export function RecepConversacionDetalleModal({
  conversation,
  isOpen,
  onClose,
  onResolved,
  onNotice,
  canSendMessages = false,
  canResolveEscalations = false,
}: RecepConversacionDetalleModalProps) {
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    isLoadingThread,
    isSending,
    isResolving,
    error,
    inputContent,
    setInputContent,
    loadThread,
    sendMessage,
    resolve,
  } = useRecepConversacionDetalle({
    conversationId: conversation?.conversationId ?? null,
    escalationId: conversation?.escalationId ?? null,
    relatedConversationIds: conversation?.relatedConversationIds,
    canSendMessages,
    canResolveEscalations,
    onResolved: (escId) => {
      setIsResolveModalOpen(false)
      onResolved?.(escId)
      onClose()
    },
    onNotice,
  })

  // Auto-scroll al final al recibir o enviar mensajes
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen, messages])

  if (!isOpen || !conversation) return null

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputContent.trim() && !isSending && canSendMessages) {
        void sendMessage()
      }
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputContent.trim() && !isSending && canSendMessages) {
      void sendMessage()
    }
  }

  const handleConfirmResolution = async (notes?: string) => {
    await resolve(notes)
  }

  const isAnonymous =
    !conversation.clientName ||
    conversation.clientName.toLowerCase().includes('cliente sin nombre')

  return (
    <>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden modal-backdrop-animate"
        role="dialog"
        aria-modal="true"
        aria-label={`Conversación con ${conversation.clientName}`}
      >
        <button
          type="button"
          className="absolute inset-0 bg-charcoal/40 backdrop-blur-xs cursor-pointer border-0"
          aria-label="Cerrar detalle de conversación"
          onClick={onClose}
        />

        <div className="relative z-10 w-full max-w-4xl h-[92vh] max-h-[760px] min-h-[480px] bg-white border border-border-tan rounded-2xl shadow-2xl overflow-hidden flex flex-col modal-content-animate">
          {/* HEADER */}
          <header className="shrink-0 flex items-center justify-between gap-3 p-3.5 sm:p-4 border-b border-border-tan bg-white z-10 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-cream text-brand border border-border-tan flex items-center justify-center shrink-0 font-extrabold text-xs shadow-2xs">
                {isAnonymous ? (
                  <UserAvatarIcon className="w-5 h-5 opacity-70" />
                ) : (
                  conversation.clientName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase() ?? '')
                    .join('')
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-extrabold text-brand truncate">
                    {conversation.clientName}
                  </h2>
                  <ChannelBadge channel={conversation.channel} />
                </div>
                <div className="flex items-center gap-2 text-xs text-sage font-medium mt-0.5 truncate">
                  {conversation.clientPhone && <span>{conversation.clientPhone} · </span>}
                  <span>Esperando hace {conversation.waitingTimeLabel}</span>
                  {conversation.reason && (
                    <span className="hidden md:inline truncate max-w-xs text-charcoal/80">
                      · Motivo: {conversation.reason}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canResolveEscalations && conversation.escalationId && (
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(true)}
                  disabled={isResolving}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
                  title="Marcar caso como resuelto"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Marcar como resuelta</span>
                  <span className="sm:hidden">Resolver</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center bg-white"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </header>

          {/* MENSAJES CONTAINER */}
          <div className="flex-1 min-h-0 bg-bone/30 overflow-y-auto p-3 sm:p-4 flex flex-col">
            {isLoadingThread && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-2">
                <div className="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
                <p className="text-xs font-medium text-sage">Cargando mensajes…</p>
              </div>
            )}

            {error && !isLoadingThread && (
              <div className="p-4 my-auto bg-red-50 border border-red-200 text-red-800 rounded-xl flex flex-col items-center gap-2 text-center">
                <p className="text-xs font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadThread()}
                  className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!isLoadingThread && !error && messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
                <div className="w-12 h-12 rounded-full bg-cream text-brand border border-border-tan flex items-center justify-center mb-3">
                  <ChatIcon className="w-6 h-6 opacity-70" />
                </div>
                <h4 className="text-sm font-bold text-brand mb-1">
                  Todavía no hay mensajes registrados en esta conversación
                </h4>
                <p className="text-xs text-sage max-w-sm">
                  Escribe una respuesta a continuación para iniciar el diálogo directo con el cliente.
                </p>
              </div>
            )}

            {!isLoadingThread && !error && messages.length > 0 && (
              <div className="flex flex-col gap-1 py-1">
                {messages.map((msg) => (
                  <RecepChatMessageBubble
                    key={msg.id}
                    message={msg}
                    clientName={conversation.clientName}
                    onRetry={() => void sendMessage(msg.content)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* INPUT FOOTER */}
          {canSendMessages && (
          <footer className="shrink-0 p-3 sm:p-4 border-t border-border-tan bg-white">
            <form onSubmit={handleFormSubmit} className="flex items-end gap-2 sm:gap-3">
              <div className="flex-1 relative min-w-0">
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe una respuesta para el cliente... (Enter para enviar)"
                  rows={2}
                  disabled={isSending || isResolving}
                  className="w-full rounded-xl border border-border-tan bg-bone/30 p-2.5 sm:p-3 text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 resize-none transition max-h-28 shadow-2xs disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={!inputContent.trim() || isSending || isResolving}
                className="h-10 sm:h-12 px-4 sm:px-5 rounded-xl bg-brand text-white font-bold text-xs sm:text-sm hover:bg-brand-hover transition cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shrink-0"
              >
                {isSending ? (
                  <>
                    <ReloadIcon className="w-4 h-4 animate-spin text-white" />
                    <span className="hidden sm:inline">Enviando…</span>
                  </>
                ) : (
                  <>
                    <span>Enviar</span>
                    <span className="text-xs">➔</span>
                  </>
                )}
              </button>
            </form>
          </footer>
          )}
        </div>
      </div>

      {/* MODAL DE RESOLUCIÓN */}
      <RecepResolverEscalacionModal
        isOpen={isResolveModalOpen && canResolveEscalations && Boolean(conversation.escalationId)}
        clientName={conversation.clientName}
        isResolving={isResolving}
        onClose={() => setIsResolveModalOpen(false)}
        onConfirm={handleConfirmResolution}
      />
    </>
  )
}

function ChannelBadge({ channel }: { channel: EscalatedConversationListItem['channel'] }) {
  if (channel === 'Telegram') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#229ED9]/10 text-[#0088cc] border border-[#229ED9]/20">
        Telegram
      </span>
    )
  }
  if (channel === 'Web') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sage-soft text-brand border border-border-tan">
        Web
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-bone text-sage border border-border-tan">
      {channel}
    </span>
  )
}


