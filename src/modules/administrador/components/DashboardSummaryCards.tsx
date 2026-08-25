import type { DashboardStats } from '../types'
import { StatCard } from './StatCard'
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  StethoscopeIcon,
} from './DashboardIcons'

interface DashboardSummaryCardsProps {
  stats: DashboardStats
  dateText?: string
}

export function DashboardSummaryCards({
  stats,
  dateText = 'Jueves, 24 de Octubre',
}: DashboardSummaryCardsProps) {
  return (
    <section className="space-y-2.5 sm:space-y-3" aria-labelledby="resumen-hoy-title">
      {/* Title & Date */}
      <div>
        <h1
          id="resumen-hoy-title"
          className="text-2xl sm:text-3xl font-bold text-[#2C3A38] tracking-tight leading-tight"
        >
          Resumen de Hoy
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#658E83] mt-0.5">
          {stats.formattedDate || dateText}
        </p>
      </div>

      {/* 4 Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <StatCard
          label="Citas del Día"
          value={stats.totalAppointments}
          icon={<CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          iconBgColor="bg-[#FAF5EC]"
          iconColor="text-[#658E83]"
        />

        <StatCard
          label="Atendidas"
          value={stats.attendedAppointments}
          subValue={`${stats.attendedPercentage}%`}
          icon={<CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          iconBgColor="bg-[#E8EFEA]"
          iconColor="text-[#234E46]"
        />

        <StatCard
          label="Canceladas"
          value={stats.cancelledAppointments}
          icon={<XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          iconBgColor="bg-[#FBECE8]"
          iconColor="text-[#C86D51]"
        />

        <StatCard
          label="Profesionales Activos"
          value={stats.activeProfessionals}
          icon={<StethoscopeIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          iconBgColor="bg-[#FBF1E6]"
          iconColor="text-[#C86D51]"
        />
      </div>
    </section>
  )
}
