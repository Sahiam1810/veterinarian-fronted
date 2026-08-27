import type { ReactNode } from 'react'
import {
  CalendarPlusIcon,
  PawIcon,
  PlusIcon,
  UserPlusIcon,
} from '@/global/components'
import type { RecepQuickActionId } from '../types'

interface RecepQuickActionsProps {
  onAction?: (actionId: RecepQuickActionId) => void
}

const ACTIONS: {
  id: RecepQuickActionId
  label: string
  className: string
  icon: ReactNode
}[] = [
  {
    id: 'agendar-cita',
    label: 'Agendar Cita',
    className: 'bg-brand hover:bg-brand-hover text-white',
    icon: <PlusIcon className="w-4 h-4" />,
  },
  {
    id: 'registrar-dueno',
    label: 'Registrar Dueño',
    className: 'bg-charcoal hover:bg-charcoal/90 text-white',
    icon: <UserPlusIcon className="w-5 h-5" />,
  },
  {
    id: 'registrar-mascota',
    label: 'Registrar Mascota',
    className: 'bg-ochre hover:bg-ochre/90 text-charcoal',
    icon: <PawIcon className="w-4.5 h-4.5" />,
  },
]

export function RecepQuickActions({ onAction }: RecepQuickActionsProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction?.(action.id)}
          className={`inline-flex items-center justify-center gap-2.5 rounded-2xl px-4 py-3.5 sm:py-4 text-sm sm:text-base font-bold shadow-[0_2px_10px_rgba(35,78,70,0.08)] transition cursor-pointer ${action.className}`}
        >
          <span className="shrink-0" aria-hidden>
            {action.id === 'agendar-cita' ? (
              <CalendarPlusIcon className="w-5 h-5" />
            ) : (
              action.icon
            )}
          </span>
          <span>{action.label}</span>
        </button>
      ))}
    </section>
  )
}
