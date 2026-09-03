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
    <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 sm:p-6 lg:p-7 border border-border-tan shadow-[0_4px_24px_rgba(35,78,70,0.035)] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-charcoal tracking-tight">
            Próximas Citas
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-bone text-sage border border-border-tan">
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
            <tr className="bg-bone rounded-xl text-xs font-bold text-charcoal/75 border border-border-tan/50">
              <th className="py-3 px-4 sm:px-6 first:rounded-l-xl">Hora</th>
              <th className="py-3 px-4 sm:px-6">Mascota</th>
              <th className="py-3 px-4 sm:px-6">Servicio</th>
              <th className="py-3 px-4 sm:px-6">Profesional</th>
              <th className="py-3 px-4 sm:px-6 last:rounded-r-xl text-center sm:text-left">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-tan/35 text-xs sm:text-sm">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-charcoal/60">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-bone text-sage flex items-center justify-center border border-border-tan">
                      <PawIcon className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="font-medium text-sm">No hay citas programadas para hoy.</p>
                  </div>
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  onClick={() => onSelectAppointment?.(appointment)}
                  className="group hover:bg-bone/60 transition-colors cursor-pointer"
                >
                  {/* Hora */}
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-charcoal whitespace-nowrap group-hover:text-brand transition-colors">
                    {appointment.time}
                  </td>

                  {/* Mascota */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-border-tan/70 text-sage flex items-center justify-center shrink-0 border border-sage/15 group-hover:scale-105 transition-transform">
                        <PawIcon className="w-4 h-4" />
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
                  <td className="py-3.5 px-4 sm:px-6 text-charcoal/90 font-medium whitespace-nowrap">
                    {appointment.service}
                  </td>

                  {/* Profesional */}
                  <td className="py-3.5 px-4 sm:px-6 text-charcoal/90 font-medium whitespace-nowrap">
                    {appointment.professional}
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4 sm:px-6 text-center sm:text-left whitespace-nowrap">
                    <StatusBadge status={appointment.status} />
                  </td>
                </tr>
              ))
            )}
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
