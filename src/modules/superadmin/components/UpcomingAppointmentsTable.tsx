import type { Appointment, AppointmentStatus } from '../types'
import { PawIcon } from './DashboardIcons'

interface UpcomingAppointmentsTableProps {
  appointments: Appointment[]
  onViewAll?: () => void
  onSelectAppointment?: (appointment: Appointment) => void
}

export function UpcomingAppointmentsTable({
  appointments,
  onViewAll,
  onSelectAppointment,
}: UpcomingAppointmentsTableProps) {
  return (
    <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-4 sm:p-5 lg:p-6 border border-border-tan shadow-[0_4px_24px_rgba(35,78,70,0.035)] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-charcoal tracking-tight">
            Próximas Citas
          </h2>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-bone text-sage border border-border-tan">
            {appointments.length} en espera
          </span>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-hover transition hover:underline cursor-pointer flex items-center gap-1 group"
        >
          Ver todas
        </button>
      </div>

      {/* Table responsive wrapper */}
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-bone rounded-xl text-[11px] sm:text-xs font-bold text-charcoal/75 border border-border-tan/50">
              <th className="py-2.5 px-3 sm:px-4 first:rounded-l-xl">Hora</th>
              <th className="py-2.5 px-3 sm:px-4">Mascota</th>
              <th className="py-2.5 px-3 sm:px-4">Servicio</th>
              <th className="py-2.5 px-3 sm:px-4">Profesional</th>
              <th className="py-2.5 px-3 sm:px-4 last:rounded-r-xl text-center sm:text-left">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-tan/35 text-xs sm:text-sm">
            {appointments.map((appointment) => (
              <tr
                key={appointment.id}
                onClick={() => onSelectAppointment?.(appointment)}
                className="group hover:bg-bone/60 transition-colors cursor-pointer"
              >
                {/* Hora */}
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-charcoal whitespace-nowrap group-hover:text-brand transition-colors">
                  {appointment.time}
                </td>

                {/* Mascota */}
                <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-border-tan/70 text-sage flex items-center justify-center shrink-0 border border-sage/15 group-hover:scale-105 transition-transform">
                      <PawIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-charcoal">
                      {appointment.petName}
                    </span>
                    <span className="text-xs text-charcoal/60 font-normal">
                      ({appointment.petType})
                    </span>
                  </div>
                </td>

                {/* Servicio */}
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-charcoal/90 font-medium whitespace-nowrap">
                  {appointment.service}
                </td>

                {/* Profesional */}
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-charcoal/90 font-medium whitespace-nowrap">
                  {appointment.professional}
                </td>

                {/* Estado */}
                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center sm:text-left whitespace-nowrap">
                  <StatusBadge status={appointment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles: Record<AppointmentStatus, { container: string; dot: string }> = {
    Agendado: {
      container: 'bg-mint-soft text-brand border border-brand/10',
      dot: 'bg-brand',
    },
    'En sala': {
      container: 'bg-ochre-soft text-terracotta border border-terracotta/15',
      dot: 'bg-terracotta',
    },
    Atendido: {
      container: 'bg-mint-soft text-brand border border-brand/10',
      dot: 'bg-brand',
    },
    Cancelado: {
      container: 'bg-terracotta-soft text-terracotta border border-terracotta/15',
      dot: 'bg-terracotta',
    },
  }

  const current = styles[status] || styles.Agendado

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${current.container}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{status}</span>
    </span>
  )
}
