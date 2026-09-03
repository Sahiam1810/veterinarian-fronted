import { PawIcon } from '@/global/components'
import type { VetDayAppointment } from '../types'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'
import { EyeIcon, ListBulletIcon, MoreVerticalIcon } from './VetHomeIcons'

interface VetAgendaDelDiaProps {
  appointments: VetDayAppointment[]
  totalAppointmentsToday: number
  onViewFullAgenda?: () => void
  onAttendNow?: (appointment: VetDayAppointment) => void
  onViewAppointment?: (appointment: VetDayAppointment) => void
  onMoreActions?: (appointment: VetDayAppointment) => void
}

// Agenda del día: cards en móvil, tabla desde md.
export function VetAgendaDelDia({
  appointments,
  totalAppointmentsToday,
  onViewFullAgenda,
  onAttendNow,
  onViewAppointment,
  onMoreActions,
}: VetAgendaDelDiaProps) {
  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(35,78,70,0.04)] overflow-hidden min-w-0">
      <div className="flex items-center justify-between gap-2 px-3 sm:px-5 lg:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 min-w-0">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span className="text-brand shrink-0">
            <ListBulletIcon className="w-5 h-5" />
          </span>
          <h2 className="text-base sm:text-lg font-bold text-brand tracking-tight truncate">
            Agenda del Día
          </h2>
        </div>
        <button
          type="button"
          onClick={onViewFullAgenda}
          className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-hover transition cursor-pointer flex items-center gap-1 shrink-0 group"
        >

          <span className="hidden sm:inline">Ver agenda completa</span>
          <span className="sm:hidden">Ver agenda</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>

        </button>
      </div>

      {/* Móvil: lista de tarjetas */}
      <div className="md:hidden px-3 pb-3 space-y-2.5">
        {appointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-sage">No hay citas programadas para hoy.</p>
        ) : (
          appointments.map((appointment) => (
            <MobileAgendaCard
              key={appointment.id}
              appointment={appointment}
              onAttendNow={onAttendNow}
              onViewAppointment={onViewAppointment}
              onMoreActions={onMoreActions}
            />
          ))
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-y border-border-tan/70 bg-bone/60 text-[11px] sm:text-xs font-bold text-sage uppercase tracking-wide">
              <th className="py-3 px-4 sm:px-5 font-bold">Hora</th>
              <th className="py-3 px-3 sm:px-4 font-bold">Mascota</th>
              <th className="py-3 px-3 sm:px-4 font-bold">Especie / Raza</th>
              <th className="py-3 px-3 sm:px-4 font-bold">Dueño</th>
              <th className="py-3 px-3 sm:px-4 font-bold">Servicio</th>
              <th className="py-3 px-3 sm:px-4 font-bold">Estado</th>
              <th className="py-3 px-4 sm:px-5 font-bold text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 px-4 text-center text-sm text-sage">
                  No hay citas programadas para hoy.
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <AgendaRow
                  key={appointment.id}
                  appointment={appointment}
                  onAttendNow={onAttendNow}
                  onViewAppointment={onViewAppointment}
                  onMoreActions={onMoreActions}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs sm:text-sm text-sage/90 py-3 sm:py-4 px-3 sm:px-4 border-t border-border-tan/60">
        Mostrando {appointments.length} de {totalAppointmentsToday} citas programadas para hoy.
      </p>
    </section>
  )
}

function MobileAgendaCard({
  appointment,
  onAttendNow,
  onViewAppointment,
  onMoreActions,
}: AgendaRowProps) {
  const highlighted = Boolean(appointment.isHighlighted)

  return (
    <article
      className={`relative rounded-xl border border-border-tan p-3 min-w-0 ${
        highlighted ? 'bg-bone/70 border-brand/25' : 'bg-white'
      }`}
    >
      {highlighted && (
        <span
          className="absolute left-0 top-2 bottom-2 w-[3px] bg-brand rounded-r-full"
          aria-hidden="true"
        />
      )}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <PetAvatar name={appointment.petName} photoUrl={appointment.petPhotoUrl} />
          <div className="min-w-0">
            <p className="font-bold text-charcoal text-sm truncate">{appointment.petName}</p>
            <p className="text-[11px] text-sage font-medium truncate">{appointment.speciesBreed}</p>
          </div>
        </div>
        <span className="text-sm font-bold text-charcoal tabular-nums shrink-0">{appointment.time}</span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-charcoal/80 font-medium">
        <span className="truncate max-w-full">{appointment.ownerName}</span>
        <span className="text-border-tan">·</span>
        <span className="truncate max-w-full">{appointment.service}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <AppointmentStatusBadge status={appointment.status} />
        <RowActions
          appointment={appointment}
          onAttendNow={onAttendNow}
          onViewAppointment={onViewAppointment}
          onMoreActions={onMoreActions}
        />
      </div>
    </article>
  )
}

interface AgendaRowProps {
  appointment: VetDayAppointment
  onAttendNow?: (appointment: VetDayAppointment) => void
  onViewAppointment?: (appointment: VetDayAppointment) => void
  onMoreActions?: (appointment: VetDayAppointment) => void
}

function AgendaRow({
  appointment,
  onAttendNow,
  onViewAppointment,
  onMoreActions,
}: AgendaRowProps) {
  const highlighted = Boolean(appointment.isHighlighted)

  return (
    <tr
      className={`relative border-b border-border-tan/50 last:border-b-0 transition-colors ${
        highlighted ? 'bg-bone/70' : 'hover:bg-bone/40'
      }`}
    >
      <td className="relative py-3.5 sm:py-4 px-4 sm:px-5 font-bold text-charcoal whitespace-nowrap text-sm">
        {highlighted && (
          <span
            className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand rounded-r-full"
            aria-hidden="true"
          />
        )}
        {appointment.time}
      </td>

      <td className="py-3.5 sm:py-4 px-3 sm:px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <PetAvatar name={appointment.petName} photoUrl={appointment.petPhotoUrl} />
          <span className="font-bold text-charcoal text-sm truncate">{appointment.petName}</span>
        </div>
      </td>

      <td className="py-3.5 sm:py-4 px-3 sm:px-4 text-sm text-charcoal/80 font-medium whitespace-nowrap">
        {appointment.speciesBreed}
      </td>

      <td className="py-3.5 sm:py-4 px-3 sm:px-4 text-sm text-charcoal/80 font-medium whitespace-nowrap">
        {appointment.ownerName}
      </td>

      <td className="py-3.5 sm:py-4 px-3 sm:px-4 text-sm text-charcoal/85 font-medium whitespace-nowrap">
        {appointment.service}
      </td>

      <td className="py-3.5 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
        <AppointmentStatusBadge status={appointment.status} />
      </td>

      <td className="py-3.5 sm:py-4 px-4 sm:px-5 text-right whitespace-nowrap">
        <RowActions
          appointment={appointment}
          onAttendNow={onAttendNow}
          onViewAppointment={onViewAppointment}
          onMoreActions={onMoreActions}
        />
      </td>
    </tr>
  )
}

function PetAvatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-border-tan shrink-0"
      />
    )
  }

  return (
    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-cream text-sage flex items-center justify-center border border-border-tan shrink-0">
      <PawIcon className="w-3.5 h-3.5" />
    </div>
  )
}

function RowActions({
  appointment,
  onAttendNow,
  onViewAppointment,
  onMoreActions,
}: AgendaRowProps) {
  if (appointment.status === 'EN ESPERA') {
    return (
      <button
        type="button"
        onClick={() => onAttendNow?.(appointment)}
        className="inline-flex items-center justify-center px-3 sm:px-3.5 py-2 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-sm"
      >
        Atender ahora
      </button>
    )
  }

  if (appointment.status === 'ATENDIDO') {
    return (
      <button
        type="button"
        onClick={() => onViewAppointment?.(appointment)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-bone text-sage border border-border-tan hover:text-brand hover:border-brand/30 transition cursor-pointer"
        aria-label={`Ver cita de ${appointment.petName}`}
        title="Ver detalle"
      >
        <EyeIcon className="w-4 h-4" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onMoreActions?.(appointment)}
      className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-bone text-sage border border-border-tan hover:text-brand hover:border-brand/30 transition cursor-pointer"
      aria-label={`Más acciones para ${appointment.petName}`}
      title="Más acciones"
    >
      <MoreVerticalIcon className="w-4 h-4" />
    </button>
  )
}
