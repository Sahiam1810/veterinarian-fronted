import type { ReactNode } from 'react'
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@/global/components'
import type { RecepHomeStats } from '../types'

interface RecepHomeStatCardsProps {
  stats: RecepHomeStats
}

interface StatItem {
  id: string
  label: string
  value: number
  icon: ReactNode
  iconWrapClass: string
}

export function RecepHomeStatCards({ stats }: RecepHomeStatCardsProps) {
  const items: StatItem[] = [
    {
      id: 'citas-dia',
      label: 'Citas del día',
      value: stats.citasDelDia,
      icon: <CalendarIcon className="w-5 h-5" />,
      iconWrapClass: 'bg-brand/10 text-brand',
    },
    {
      id: 'pendientes',
      label: 'Pendientes',
      value: stats.pendientes,
      icon: <HourglassIcon className="w-5 h-5" />,
      iconWrapClass: 'bg-ochre/25 text-terracotta',
    },
    {
      id: 'atendidas',
      label: 'Mascotas atendidas',
      value: stats.mascotasAtendidas,
      icon: <CheckCircleIcon className="w-5 h-5" />,
      iconWrapClass: 'bg-border-tan text-sage',
    },
    {
      id: 'canceladas',
      label: 'Canceladas',
      value: stats.canceladas,
      icon: <XCircleIcon className="w-5 h-5" />,
      iconWrapClass: 'bg-terracotta-soft text-terracotta',
    },
  ]

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="bg-white rounded-2xl border border-border-tan shadow-[0_2px_12px_rgba(35,78,70,0.04)] px-4 py-4 sm:px-5 sm:py-5 flex items-start justify-between gap-3"
        >
          <div className="flex flex-col min-w-0 gap-1">
            <span className="text-sm font-medium text-sage">{item.label}</span>
            <span className="text-3xl sm:text-[2rem] font-extrabold text-charcoal leading-none tracking-tight">
              {item.value}
            </span>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconWrapClass}`}
          >
            {item.icon}
          </div>
        </article>
      ))}
    </section>
  )
}

function HourglassIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 2h14" />
      <path d="M5 22h14" />
      <path d="M12 12 7 7V2h10v5l-5 5Z" />
      <path d="M12 12 7 17v5h10v-5l-5-5Z" />
    </svg>
  )
}
