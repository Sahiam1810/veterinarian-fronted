import { PawIcon } from '@/global/components'
import type { RecepDayAppointment } from '../types'
import { RecepAppointmentStatusBadge } from './RecepAppointmentStatusBadge'

interface RecepAgendaDelDiaProps {
  appointments: RecepDayAppointment[]
  onViewFullMonth?: () => void
  onRowAction?: (appointment: RecepDayAppointment) => void
}

export function RecepAgendaDelDia({
  appointments,
  onViewFullMonth,
  onRowAction,
}: RecepAgendaDelDiaProps) {
  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(35,78,70,0.04)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 lg:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
        <h2 className="text-base sm:text-lg font-bold text-charcoal tracking-tight truncate">
          Agenda del Día
        </h2>
        <button
          type="button"
          onClick={onViewFullMonth}
          className="text-xs sm:text-sm font-semibold text-sage hover:text-brand transition cursor-pointer flex items-center gap-1 shrink-0 group"
        >
          Ver todo el mes
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[880px]">
          <thead>
            <tr className="border-y border-border-tan/70 bg-bone/60 text-[11px] sm:text-xs font-bold text-sage uppercase tracking-wide">
              <th className="py-3 px-4 sm:px-5 font-bold">Hora</th>
              <th className="py-3 px-3 sm:px-4 font-bold">Mascota</th>
              <th className="py-3 px-3 sm:px-4 font-bold">Dueño</th>
              <th className="py-3 px-3 sm:px-4 font-bold">Profesional</th>
              <th className="py-3 px-3 sm:px-4 font-bold">Servicio</th>
              <th className="py-3 px-3 sm:px-4 font-bold">Estado</th>
              <th className="py-3 px-4 sm:px-5 font-bold text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr
                key={appointment.id}
                className="border-b border-border-tan/50 last:border-b-0 hover:bg-bone/40 transition-colors"
              >
                <td className="py-3.5 sm:py-4 px-4 sm:px-5 font-bold text-charcoal whitespace-nowrap text-sm">
                  {appointment.time}
                </td>
                <td className="py-3.5 sm:py-4 px-3 sm:px-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PetAvatar name={appointment.petName} photoUrl={appointment.petPhotoUrl} />
                    <div className="min-w-0 flex flex-col">
                      <span className="font-bold text-charcoal text-sm truncate">
                        {appointment.petName}
                      </span>
                      <span className="text-xs text-sage truncate">
                        {appointment.speciesBreed}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 sm:py-4 px-3 sm:px-4 text-sm text-charcoal/85 font-medium whitespace-nowrap">
                  {appointment.ownerName}
                </td>
                <td className="py-3.5 sm:py-4 px-3 sm:px-4 text-sm text-charcoal/85 font-medium whitespace-nowrap">
                  {appointment.professionalName}
                </td>
                <td className="py-3.5 sm:py-4 px-3 sm:px-4 text-sm text-charcoal/85 font-medium whitespace-nowrap">
                  {appointment.service}
                </td>
                <td className="py-3.5 sm:py-4 px-3 sm:px-4">
                  <RecepAppointmentStatusBadge status={appointment.status} />
                </td>
                <td className="py-3.5 sm:py-4 px-4 sm:px-5 text-right">
                  <button
                    type="button"
                    onClick={() => onRowAction?.(appointment)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sage hover:bg-bone hover:text-brand transition cursor-pointer"
                    aria-label={`Acciones de ${appointment.petName}`}
                  >
                    <MoreIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PetAvatar({
  name,
  photoUrl,
}: {
  name: string
  photoUrl?: string | null
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className="w-9 h-9 rounded-full object-cover border border-border-tan shrink-0"
      />
    )
  }

  return (
    <span className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
      <PawIcon className="w-3.5 h-3.5" />
      <span className="sr-only">{name}</span>
    </span>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  )
}
