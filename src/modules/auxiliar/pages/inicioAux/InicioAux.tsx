import { useState } from 'react'
import type { AuxDayAppointment } from '../../types'
import { useAuxDashboard } from '../../hooks'
import { ViewPopup, DetalleCitaDrawer } from '../../components'
import { PageToast } from '@/global/components'

export interface InicioAuxProps {
  userName?: string
  onNotice?: (message: string) => void
  onViewAppointment?: (appointment: AuxDayAppointment) => void
}

export function InicioAux({
  userName = 'Laura',
  onViewAppointment,
}: InicioAuxProps) {
  const { appointments, stats, isLoading, activeNotification } = useAuxDashboard()

  const [selectedAppointment, setSelectedAppointment] = useState<AuxDayAppointment | null>(null)

  const handleOpenView = (apt: AuxDayAppointment) => {
    if (onViewAppointment) {
      onViewAppointment(apt)
      return
    }
    setSelectedAppointment(apt)
  }

  const formattedCurrentDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const formattedDateCapitalized =
    formattedCurrentDate.charAt(0).toUpperCase() + formattedCurrentDate.slice(1)

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6">
      {/* 1. Header / Saludo */}
      <ViewPopup delayMs={30}>
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
              Buenos días, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-sage font-medium mt-0.5">
              {formattedDateCapitalized} • Resumen calculado en cliente a partir de las citas.
            </p>
          </div>
        </header>
      </ViewPopup>

      {/* 2. Tarjetas de Estadísticas con efecto cascada (Staggered Pop-up) */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Citas del día */}
        <ViewPopup delayMs={70}>
          <article className="bg-white rounded-2xl border border-border-tan shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 sm:p-5 flex flex-col justify-between transition hover:shadow-md h-full">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#e8f3ef] text-[#1b4332] flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#143d36] tracking-tight">
                {stats.citasDelDia}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-500 mt-3 sm:mt-4">
              Citas del día
            </span>
          </article>
        </ViewPopup>

        {/* Card 2: Próximas */}
        <ViewPopup delayMs={110}>
          <article className="bg-white rounded-2xl border border-border-tan shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 sm:p-5 flex flex-col justify-between transition hover:shadow-md h-full">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#fef0e6] text-[#b45309] flex items-center justify-center">
                <ClockOutlineIcon className="w-5 h-5" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#78350f] tracking-tight">
                {stats.proximas ?? 0}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-500 mt-3 sm:mt-4">
              Próximas
            </span>
          </article>
        </ViewPopup>

        {/* Card 3: Atendidas por Vet */}
        <ViewPopup delayMs={150}>
          <article className="bg-white rounded-2xl border border-border-tan shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 sm:p-5 flex flex-col justify-between transition hover:shadow-md h-full">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#e1f5ee] text-[#0f766e] flex items-center justify-center">
                <CheckCircleOutlineIcon className="w-5 h-5" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0f766e] tracking-tight">
                {stats.atendidas}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-500 mt-3 sm:mt-4">
              Atendidas por Vet
            </span>
          </article>
        </ViewPopup>
      </section>

      {/* 3. Sección "Citas de hoy" con Pop-up Effect */}
      <ViewPopup delayMs={230}>
        <section className="flex flex-col gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-brand tracking-tight">
            Citas de hoy ({appointments.length})
          </h2>

          {/* Tabla de Citas */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="bg-[#dce9e3] text-[#34524a] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6 font-bold">HORA</th>
                    <th className="py-3.5 px-4 sm:px-5 font-bold">MASCOTA</th>
                    <th className="py-3.5 px-4 sm:px-5 font-bold">SERVICIO</th>
                    <th className="py-3.5 px-4 sm:px-5 font-bold">PROFESIONAL</th>
                    <th className="py-3.5 px-3 sm:px-4 font-bold text-center">ESTADO CITA</th>
                    <th className="py-3.5 px-4 sm:px-6 font-bold text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tan/60 text-sm">
                  {isLoading ? (
                    <tr className="animate-in fade-in duration-200">
                      <td colSpan={6} className="py-12 text-center text-sage">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                          <span className="font-semibold text-xs sm:text-sm text-sage">
                            Cargando citas del servidor...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr className="animate-in fade-in duration-200">
                      <td colSpan={6} className="py-12 text-center text-sage">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-2xl bg-bone flex items-center justify-center text-sage border border-border-tan/60">
                            <svg
                              className="w-5 h-5 text-sage"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.75}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                          </div>
                          <span className="font-semibold text-xs sm:text-sm text-sage">
                            No hay citas registradas para hoy.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt) => {
                      const avatarBg =
                        apt.avatarColor === 'peach'
                          ? 'bg-[#f09a82] text-white'
                          : 'bg-brand text-white'

                      let aptBadgeClass = 'bg-[#eef2f6] text-slate-700'
                      if (apt.status === 'Atendida') aptBadgeClass = 'bg-[#d1fae5] text-[#065f46]'
                      if (apt.status === 'Cancelada' || apt.status === 'No asistió') aptBadgeClass = 'bg-[#fde8e8] text-[#c81e1e]'
                      if (apt.status === 'En espera') aptBadgeClass = 'bg-[#fef0e6] text-[#b45309]'

                      return (
                        <tr
                          key={apt.id}
                          className="hover:bg-[#fcfaf7] transition-colors"
                        >
                          {/* HORA */}
                          <td className="py-4 px-4 sm:px-6 font-bold text-charcoal whitespace-nowrap">
                            {apt.time}
                          </td>

                          {/* MASCOTA */}
                          <td className="py-4 px-4 sm:px-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarBg}`}
                              >
                                {apt.petInitial || apt.petName.charAt(0)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-charcoal truncate">
                                  {apt.petName}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {apt.speciesBreed}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* SERVICIO */}
                          <td className="py-4 px-4 sm:px-5 text-gray-700 font-medium whitespace-nowrap">
                            {apt.service}
                          </td>

                          {/* PROFESIONAL */}
                          <td className="py-4 px-4 sm:px-5 text-gray-700 font-medium whitespace-nowrap">
                            {apt.professional}
                          </td>

                          {/* ESTADO CITA OFICIAL */}
                          <td className="py-4 px-3 sm:px-4 text-center whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${aptBadgeClass}`}>
                              {apt.status}
                            </span>
                          </td>

                          {/* ACCIONES */}
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenView(apt)}
                              className="text-xs font-semibold text-charcoal hover:text-brand transition cursor-pointer"
                            >
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </ViewPopup>

      {/* Detalle de cita (solo lectura) */}
      <DetalleCitaDrawer
        isOpen={Boolean(selectedAppointment)}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />

      {/* Notificación flotante / Toast */}
      {activeNotification && <PageToast message={activeNotification} />}
    </div>
  )
}

// Iconos locales optimizados para las Stat Cards
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ClockOutlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function CheckCircleOutlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
