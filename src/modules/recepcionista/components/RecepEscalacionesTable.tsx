import type {
  EscalatedConversationListItem,
  EscalationChannel,
  EscalationPriority,
  EscalationStatus,
} from '../types'
import { ChatIcon, UserAvatarIcon } from '@/global/components'

interface RecepEscalacionesTableProps {
  items: EscalatedConversationListItem[]
  selectedId: string | null
  pageStart: number
  pageEnd: number
  totalCount: number
  currentPage?: number
  totalPages?: number
  onSelect: (id: string) => void
  onPrevPage?: () => void
  onNextPage?: () => void
  onGoToPage?: (page: number) => void
}

export function RecepEscalacionesTable({
  items,
  selectedId,
  pageStart,
  pageEnd,
  totalCount,
  currentPage = 1,
  totalPages = 1,
  onSelect,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: RecepEscalacionesTableProps) {
  if (totalCount === 0) {
    return (
      <section className="flex-1 min-w-0 min-h-[350px] flex flex-col items-center justify-center rounded-2xl border border-border-tan bg-white p-8 sm:p-12 text-center shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
        <div className="w-16 h-16 rounded-full bg-cream text-brand border border-border-tan flex items-center justify-center mb-4">
          <ChatIcon className="w-8 h-8 opacity-80" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-brand mb-1">
          No hay conversaciones esperando un asesor ahora mismo
        </h3>
        <p className="text-xs sm:text-sm text-sage max-w-md font-medium">
          Cuando un cliente solicite hablar con una persona desde el chatbot o Telegram, la conversación aparecerá automáticamente aquí.
        </p>
      </section>
    )
  }

  return (
    <section className="flex-1 min-w-0 min-h-0 flex flex-col rounded-2xl border border-border-tan bg-white overflow-hidden shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 z-10 bg-sage-soft/80 backdrop-blur-xs">
            <tr className="border-b border-border-tan text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-sage">
              <th className="py-3.5 px-3 sm:px-5 w-[28%]">Cliente / Canal</th>
              <th className="py-3.5 px-2 sm:px-4 w-[34%]">Motivo / Último Mensaje</th>
              <th className="py-3.5 px-2 sm:px-4 w-[12%] text-center">Prioridad</th>
              <th className="py-3.5 px-2 sm:px-4 w-[14%] text-center hidden sm:table-cell">En espera</th>
              <th className="py-3.5 px-3 sm:px-5 w-[12%] text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const selected = selectedId === item.id || selectedId === item.conversationId
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`border-b border-border-tan/60 last:border-b-0 cursor-pointer transition-colors ${
                    selected ? 'bg-cream/80' : 'hover:bg-bone/70'
                  }`}
                >
                  <td className="py-3.5 px-3 sm:px-5">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <ClientAvatar name={item.clientName} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-brand text-xs sm:text-sm truncate">
                            {item.clientName}
                          </p>
                          <ChannelBadge channel={item.channel} />
                        </div>
                        {item.clientPhone && (
                          <p className="text-[11px] text-sage font-medium truncate mt-0.5">
                            {item.clientPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-2 sm:px-4">
                    <div className="min-w-0">
                      {item.reason && (
                        <p className="text-xs font-bold text-charcoal/90 truncate mb-0.5">
                          {item.reason}
                        </p>
                      )}
                      <p className="text-xs text-sage font-medium line-clamp-2 leading-snug">
                        “{item.lastMessage}”
                      </p>
                      <span className="text-[10px] text-sage/80 block mt-1">
                        Hora: {item.lastMessageTimeLabel}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-2 sm:px-4 text-center">
                    <PriorityBadge priority={item.priority} />
                  </td>

                  <td className="py-3.5 px-2 sm:px-4 text-center hidden sm:table-cell">
                    <WaitingTimeBadge label={item.waitingTimeLabel} minutes={item.waitingMinutes} />
                  </td>

                  <td className="py-3.5 px-3 sm:px-5 text-right">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <footer className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-5 py-3.5 border-t border-border-tan bg-white">
        <p className="text-xs sm:text-sm text-sage font-medium truncate">
          Mostrando {pageStart} a {pageEnd} de {totalCount} conversaciones
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="px-2.5 h-8 rounded-lg border border-border-tan text-xs font-semibold text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Página anterior"
          >
            Anterior
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onGoToPage?.(page)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center justify-center ${
                currentPage === page
                  ? 'bg-brand text-white'
                  : 'border border-border-tan text-sage hover:text-brand hover:border-brand/30'
              }`}
            >
              {page}
            </button>
          ))}
          {totalPages > 5 && <span className="px-1 text-sage text-xs font-bold">…</span>}
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="px-2.5 h-8 rounded-lg border border-border-tan text-xs font-semibold text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </div>
      </footer>
    </section>
  )
}

function ClientAvatar({ name }: { name: string }) {
  const isAnonymous = !name || name.toLowerCase().includes('cliente sin nombre')
  if (isAnonymous) {
    return (
      <div className="w-9 h-9 rounded-full bg-bone text-sage border border-border-tan flex items-center justify-center shrink-0">
        <UserAvatarIcon className="w-4.5 h-4.5 opacity-70" />
      </div>
    )
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="w-9 h-9 rounded-full bg-cream text-brand border border-border-tan flex items-center justify-center shrink-0 text-xs font-extrabold">
      {initials || 'CL'}
    </div>
  )
}

function ChannelBadge({ channel }: { channel: EscalationChannel }) {
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

function PriorityBadge({ priority }: { priority: EscalationPriority }) {
  let styles = 'bg-bone text-sage border-border-tan'
  if (priority === 'Urgente') {
    styles = 'bg-danger/10 text-danger border-danger/30 font-extrabold animate-pulse'
  } else if (priority === 'Alta') {
    styles = 'bg-terracotta/15 text-terracotta border-terracotta/30 font-bold'
  } else if (priority === 'Media') {
    styles = 'bg-sage-soft text-brand border-border-tan font-semibold'
  } else if (priority === 'Baja') {
    styles = 'bg-bone text-sage border-border-tan font-normal'
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${styles}`}
    >
      {priority}
    </span>
  )
}

function WaitingTimeBadge({ label, minutes }: { label: string; minutes: number }) {
  const isHighWait = minutes >= 60
  const isMediumWait = minutes >= 20 && minutes < 60

  let colorClass = 'text-sage'
  if (isHighWait) {
    colorClass = 'text-danger font-bold'
  } else if (isMediumWait) {
    colorClass = 'text-terracotta font-semibold'
  }

  return (
    <span className={`inline-flex items-center text-xs ${colorClass}`}>
      {label}
    </span>
  )
}

function StatusBadge({ status }: { status: EscalationStatus }) {
  let styles = 'bg-sage-soft text-brand border-border-tan'
  if (status === 'Pendiente') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200'
  } else if (status === 'Asignada') {
    styles = 'bg-indigo-50 text-indigo-800 border-indigo-200'
  } else if (status === 'En atención') {
    styles = 'bg-blue-50 text-blue-800 border-blue-200'
  } else if (status === 'Resuelta') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200'
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles}`}
    >
      {status}
    </span>
  )
}
