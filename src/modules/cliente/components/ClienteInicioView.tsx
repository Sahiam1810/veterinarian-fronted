import {
  CalendarIcon,
  PawIcon,
  StethoscopeIcon,
} from '@/global/components'
import type {
  ClienteHomeStats,
  ClienteNextAppointment,
} from '../types'
import { canClienteModifyAppointment } from '../utils/appointmentRules'
import { ClienteCallClinicButton } from './ClienteCallClinicButton'

interface ClienteInicioViewProps {
  stats: ClienteHomeStats
  nextAppointment: ClienteNextAppointment | null
  onViewMascotas?: () => void
  onViewCitas?: () => void
  onReschedule?: (appointmentId: string) => void
  onViewDetails?: (appointmentId: string) => void
}

export function ClienteInicioView({
  stats,
  nextAppointment,
  onViewMascotas,
  onViewCitas,
  onReschedule,
  onViewDetails,
}: ClienteInicioViewProps) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4 sm:gap-5 min-w-0">
      <ClienteNextAppointmentCard
        appointment={nextAppointment}
        onReschedule={onReschedule}
        onViewDetails={onViewDetails}
      />

      <div className="flex flex-col gap-4 sm:gap-5 min-w-0">
        <ClienteMascotasSummaryCard
          count={stats.misMascotas}
          onViewMascotas={onViewMascotas}
        />
        <ClienteCitasPendientesCard
          count={stats.citasPendientes}
          onViewCitas={onViewCitas}
        />
      </div>
    </section>
  )
}

function ClienteNextAppointmentCard({
  appointment,
  onReschedule,
  onViewDetails,
}: {
  appointment: ClienteNextAppointment | null
  onReschedule?: (appointmentId: string) => void
  onViewDetails?: (appointmentId: string) => void
}) {
  if (!appointment) {
    return (
      <article className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(35,78,70,0.06)] p-6 sm:p-8 flex items-center justify-center min-h-[280px]">
        <p className="text-sm text-sage font-medium text-center">
          No tienes citas próximas programadas.
        </p>
      </article>
    )
  }

  return (
    <article className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(35,78,70,0.06)] overflow-hidden flex flex-col min-h-[280px]">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-bone flex items-center justify-center text-brand shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </span>
          <h2 className="text-base sm:text-lg font-bold text-charcoal truncate">
            Próxima Cita
          </h2>
        </div>
        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
          {appointment.statusLabel}
        </span>
      </div>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-11 h-11 rounded-full bg-bone flex items-center justify-center text-brand shrink-0">
              <PawIcon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-charcoal leading-snug">
                {appointment.service} - {appointment.petName}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-sage font-medium">
                <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{appointment.dateTimeLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 min-w-0 md:border-l md:border-border-tan/60 md:pl-5">
            <span className="w-11 h-11 rounded-full bg-bone flex items-center justify-center text-brand shrink-0">
              <StethoscopeIcon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-charcoal leading-snug">
                {appointment.professionalName}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-sage font-medium">
                <LocationPinIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{appointment.locationLabel}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-border-tan/70 px-5 sm:px-6 py-4 flex items-center justify-end gap-4 sm:gap-5 flex-wrap">
        {canClienteModifyAppointment(appointment.status) ? (
          <>
            <button
              type="button"
              onClick={() => onReschedule?.(appointment.id)}
              className="text-sm font-bold text-charcoal hover:text-brand transition cursor-pointer"
            >
              Reprogramar
            </button>
            <button
              type="button"
              onClick={() => onViewDetails?.(appointment.id)}
              className="inline-flex items-center justify-center rounded-xl bg-brand text-white px-5 py-2.5 text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-sm"
            >
              Ver Detalles
            </button>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto sm:ml-auto">
            <p className="text-xs sm:text-sm text-sage font-medium">
              Cita ya atendida. Para consultas, llama a recepción.
            </p>
            <ClienteCallClinicButton variant="outline" />
          </div>
        )}
      </div>
    </article>
  )
}

function ClienteMascotasSummaryCard({
  count,
  onViewMascotas,
}: {
  count: number
  onViewMascotas?: () => void
}) {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-brand text-white p-5 sm:p-6 min-h-[160px] flex flex-col shadow-[0_2px_16px_rgba(35,78,70,0.12)]">
      <PawWatermark className="absolute -top-2 -right-2 w-24 h-24 text-white/10 pointer-events-none" />
      <h2 className="text-sm sm:text-base font-bold relative z-10">Mis Mascotas</h2>
      <div className="mt-3 flex items-baseline gap-2 relative z-10">
        <span className="text-4xl sm:text-5xl font-extrabold leading-none">{count}</span>
        <span className="text-sm font-medium text-white/85">registradas</span>
      </div>
      <button
        type="button"
        onClick={onViewMascotas}
        className="mt-auto pt-4 text-left text-sm font-bold text-ochre hover:text-ochre-soft transition cursor-pointer relative z-10"
      >
        Ver mis mascotas →
      </button>
    </article>
  )
}

function ClienteCitasPendientesCard({
  count,
  onViewCitas,
}: {
  count: number
  onViewCitas?: () => void
}) {
  return (
    <article className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(35,78,70,0.06)] p-5 sm:p-6 min-h-[160px] flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm sm:text-base font-bold text-charcoal">Citas Pendientes</h2>
        <span className="w-9 h-9 rounded-xl bg-bone flex items-center justify-center text-sage shrink-0">
          <ClipboardClockIcon className="w-5 h-5" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl sm:text-5xl font-extrabold text-charcoal leading-none">
          {count}
        </span>
        <span className="text-sm font-medium text-sage">próxima</span>
      </div>
      <button
        type="button"
        onClick={onViewCitas}
        className="mt-auto pt-4 text-left text-sm font-bold text-brand hover:text-brand-hover transition cursor-pointer"
      >
        Ver mis citas →
      </button>
    </article>
  )
}

function LocationPinIcon({ className = 'w-4 h-4' }: { className?: string }) {
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ClipboardClockIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <circle cx="12" cy="14" r="3" />
      <path d="M12 12v2l1 1" />
    </svg>
  )
}

function PawWatermark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
      <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
      <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
      <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
    </svg>
  )
}
