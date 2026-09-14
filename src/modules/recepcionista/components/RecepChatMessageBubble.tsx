import type { ChatMessageItem } from '../types/index.ts'
import { UserAvatarIcon, CheckIcon, ReloadIcon } from '@/global/components'

interface RecepChatMessageBubbleProps {
  message: ChatMessageItem
  clientName?: string
  onRetry?: (message: ChatMessageItem) => void
}

export function RecepChatMessageBubble({
  message,
  clientName,
  onRetry,
}: RecepChatMessageBubbleProps) {
  const { senderRole, content, timeLabel, status, errorMessage, senderName } = message

  if (senderRole === 'system') {
    return (
      <div className="flex justify-center my-2 px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bone border border-border-tan/80 text-sage text-[11px] font-medium text-center max-w-lg shadow-2xs">
          <span>⚙️</span>
          <span>{content}</span>
          <span className="text-[10px] text-sage/70 font-normal ml-1">· {timeLabel}</span>
        </div>
      </div>
    )
  }

  if (senderRole === 'human_agent') {
    return (
      <div className="flex flex-col items-end my-2 px-2 sm:px-4 max-w-full">
        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%] justify-end">
          <div className="flex flex-col items-end min-w-0">
            <span className="text-[10px] font-bold text-sage mb-0.5 pr-1">
              {senderName || 'Asesor (Tú)'}
            </span>
            <div
              className={`rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                status === 'error'
                  ? 'bg-red-50 text-red-900 border border-red-300'
                  : 'bg-brand text-white'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{content}</p>
            </div>
            <div className="flex items-center gap-1 mt-1 pr-1 text-[10px] text-sage">
              <span>{timeLabel}</span>
              {status === 'sending' && (
                <span className="inline-flex items-center gap-0.5 text-sage font-medium">
                  <ReloadIcon className="w-3 h-3 animate-spin text-sage" />
                  <span>Enviando…</span>
                </span>
              )}
              {status === 'sent' && (
                <span className="inline-flex items-center text-brand font-bold" title="Enviado">
                  <CheckIcon className="w-3 h-3 text-brand" />
                </span>
              )}
              {status === 'error' && (
                <button
                  type="button"
                  onClick={() => onRetry?.(message)}
                  className="inline-flex items-center gap-1 text-danger font-bold hover:underline cursor-pointer"
                  title={errorMessage || 'Error al enviar'}
                >
                  <span>⚠️ Error al enviar</span>
                  <span className="underline">Reintentar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (senderRole === 'ai_agent') {
    return (
      <div className="flex flex-col items-start my-2 px-2 sm:px-4 max-w-full">
        <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
          <div className="w-8 h-8 rounded-full bg-cream text-brand border border-border-tan flex items-center justify-center shrink-0 text-xs shadow-2xs mt-1">
            🤖
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 pl-1">
              <span className="text-[11px] font-bold text-brand">Huellitas Bot</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-sage-soft text-brand border border-border-tan">
                IA
              </span>
            </div>
            <div className="rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs sm:text-sm bg-sage-soft text-charcoal/90 border border-border-tan shadow-xs leading-relaxed">
              <p className="whitespace-pre-wrap break-words">{content}</p>
            </div>
            <span className="text-[10px] text-sage mt-1 pl-1">{timeLabel}</span>
          </div>
        </div>
      </div>
    )
  }

  // Remitente Cliente
  const nameToDisplay = clientName || senderName || 'Cliente'
  const initials = nameToDisplay
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="flex flex-col items-start my-2 px-2 sm:px-4 max-w-full">
      <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
        <div className="w-8 h-8 rounded-full bg-bone text-brand border border-border-tan flex items-center justify-center shrink-0 text-[11px] font-extrabold shadow-2xs mt-1">
          {initials ? initials : <UserAvatarIcon className="w-4 h-4 opacity-70" />}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-bold text-brand mb-0.5 pl-1">
            {nameToDisplay}
          </span>
          <div className="rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs sm:text-sm bg-white text-charcoal border border-border-tan shadow-xs leading-relaxed">
            <p className="whitespace-pre-wrap break-words">{content}</p>
          </div>
          <span className="text-[10px] text-sage mt-1 pl-1">{timeLabel}</span>
        </div>
      </div>
    </div>
  )
}
