import type { ReactNode } from 'react'
import { CalendarIcon, CheckCircleIcon } from '@/global/components'
import type { VetHomeStats } from '../types'
import { ClockIcon } from './VetHomeIcons'

interface VetHomeStatCardsProps {
  stats: VetHomeStats
}

interface StatItem {
  id: string
  label: string
  value: number
  icon: ReactNode
  iconWrapClass: string
}

// Tarjetas de resumen de la jornada (leen VetHomeStats del servicio)
export function VetHomeStatCards({ stats }: VetHomeStatCardsProps) {
  const items: StatItem[] = [
    {
      id: 'citas-hoy',
      label: 'CITAS HOY',
      value: stats.citasHoy,
      icon: <CalendarIcon className="w-5 h-5" />,
      iconWrapClass: 'bg-brand text-white',
    },
    {
      id: 'pendientes',
      label: 'PENDIENTES',
      value: stats.pendientes,
      icon: <ClockIcon className="w-5 h-5" />,
      iconWrapClass: 'bg-border-tan text-sage',
    },
    {
      id: 'atendidas',
      label: 'ATENDIDAS',
      value: stats.atendidas,
      icon: <CheckCircleIcon className="w-5 h-5" />,
      iconWrapClass: 'bg-terracotta-soft text-terracotta',
    },
  ]

  return (
    <section className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-5 min-w-0">
      {items.map((item) => (
        <article
          key={item.id}
          className="bg-white rounded-xl sm:rounded-2xl border border-border-tan shadow-[0_2px_12px_rgba(35,78,70,0.04)] px-2 py-2.5 sm:px-5 sm:py-5 flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-4 min-w-0 text-center sm:text-left"
        >
          <div
            className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${item.iconWrapClass}`}
          >
            {item.icon}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] sm:text-xs font-bold tracking-wide text-sage uppercase truncate">
              {item.label}
            </span>
            <span className="text-xl sm:text-3xl font-extrabold text-charcoal leading-tight tracking-tight">
              {item.value}
            </span>
          </div>
        </article>
      ))}
    </section>
  )
}
