import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { AuxDayAppointment, AuxStatSummary } from '../../types'
import {
  ViewPopup,
  NuevaCitaDrawer,
  PrepararCitaDrawer,
  DetalleCitaDrawer,
} from '../../components'

export interface InicioAuxProps {
  userName?: string
  onNotice?: (message: string) => void
  onNewAppointment?: () => void
  onPrepareAppointment?: (appointment: AuxDayAppointment) => void
  onViewAppointment?: (appointment: AuxDayAppointment) => void
}

const INITIAL_STATS: AuxStatSummary = {
  citasDelDia: 12,
  pendientesPrep: 3,
  proximas: 4,
  preparadas: 5,
}

const INITIAL_APPOINTMENTS: AuxDayAppointment[] = [
  {
    id: 'apt-1',
    time: '09:00 AM',
    petName: 'Luna',
    petInitial: 'L',
    avatarColor: 'peach',
    speciesBreed: 'Perro / Golden Retriever',
    service: 'Consulta General',
    professional: 'Dra. Martínez',
    status: 'Pendiente',
    ownerName: 'Andrea Gómez',
    notes: 'Revisión periódica y control de vacunas anuales.',
  },
  {
    id: 'apt-2',
    time: '09:45 AM',
    petName: 'Simba',
    petInitial: 'S',
    avatarColor: 'brand',
    speciesBreed: 'Gato / Siamés',
    service: 'Vacunación',
    professional: 'Dr. López',
    status: 'Preparada',
    ownerName: 'Carlos Morales',
    notes: 'Dosis refuerzo de vacuna triple felina.',
  },
  {
    id: 'apt-3',
    time: '10:30 AM',
    petName: 'Rocky',
    petInitial: 'R',
    avatarColor: 'peach',
    speciesBreed: 'Perro / Bulldog Francés',
    service: 'Limpieza Dental',
    professional: 'Dra. Martínez',
    status: 'Pendiente',
    ownerName: 'Sofía Valenzuela',
    notes: 'Requiere preparación previa y verificación de ayuno.',
  },
  {
    id: 'apt-4',
    time: '11:15 AM',
    petName: 'Milo',
    petInitial: 'M',
    avatarColor: 'brand',
    speciesBreed: 'Gato / Persa',
    service: 'Control Dermatológico',
    professional: 'Dr. López',
    status: 'Preparada',
    ownerName: 'Javier Castillo',
    notes: 'Alergia en piel bajo tratamiento.',
  },
  {
    id: 'apt-5',
    time: '12:00 PM',
    petName: 'Coco',
    petInitial: 'C',
    avatarColor: 'peach',
    speciesBreed: 'Perro / Poodle',
    service: 'Desparasitación',
    professional: 'Dr. Roberto Silva',
    status: 'Pendiente',
    ownerName: 'Mariana Ríos',
    notes: 'Control semestral de parásitos internos y externos.',
  },
]

export function InicioAux({
  userName = 'Laura',
  onNotice,
  onNewAppointment,
  onPrepareAppointment,
  onViewAppointment,
}: InicioAuxProps) {
  const [appointments, setAppointments] = useState<AuxDayAppointment[]>(INITIAL_APPOINTMENTS)
  const [stats, setStats] = useState<AuxStatSummary>(INITIAL_STATS)
  const [selectedAppointment, setSelectedAppointment] = useState<AuxDayAppointment | null>(null)
  const [prepAppointment, setPrepAppointment] = useState<AuxDayAppointment | null>(null)
  const [isNewAppointmentDrawerOpen, setIsNewAppointmentDrawerOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'TODAS' | 'Pendiente' | 'Preparada'>('TODAS')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showLocalToast = (msg: string) => {
    setToastMessage(msg)
    if (onNotice) onNotice(msg)
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr))
    }, 3500)
  }

  const handleOpenPrepare = (apt: AuxDayAppointment) => {
    if (onPrepareAppointment) {
      onPrepareAppointment(apt)
      return
    }
    setPrepAppointment(apt)
  }

  const handleSavePreparation = (
    appointmentId: string,
    data: { weight: string; temp: string; notes?: string }
  ) => {
    const targetApt = appointments.find((a) => a.id === appointmentId)

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointmentId
          ? {
              ...item,
              status: 'Preparada',
              notes: data.notes || item.notes,
            }
          : item
      )
    )

    setStats((prev) => ({
      ...prev,
      pendientesPrep: Math.max(0, prev.pendientesPrep - 1),
      preparadas: prev.preparadas + 1,
    }))

    const petName = targetApt?.petName || 'Paciente'
    showLocalToast(`¡Mascota ${petName} marcada como Preparada con éxito!`)
    setPrepAppointment(null)
  }

  const handleOpenView = (apt: AuxDayAppointment) => {
    if (onViewAppointment) {
      onViewAppointment(apt)
      return
    }
    setSelectedAppointment(apt)
  }

  const handleOpenNewAppointment = () => {
    if (onNewAppointment) {
      onNewAppointment()
      return
    }
    setIsNewAppointmentDrawerOpen(true)
  }

  const handleSaveNewAppointment = (newApt: AuxDayAppointment) => {
    setAppointments((prev) => [newApt, ...prev])
    setStats((prev) => ({
      ...prev,
      citasDelDia: prev.citasDelDia + 1,
      pendientesPrep: prev.pendientesPrep + 1,
    }))

    showLocalToast(`¡Cita agendada para ${newApt.petName} exitosamente!`)
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === 'TODAS') return true
    return apt.status === filterStatus
  })

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6">
      {/* 1. Header / Saludo y botón Nueva Cita con Popup Effect */}
      <ViewPopup delayMs={30}>
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
              Buenos días, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-sage font-medium mt-0.5">
              Viernes, 24 de Noviembre de 2023
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleOpenNewAppointment}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-semibold hover:bg-brand-hover active:scale-98 transition shadow-sm cursor-pointer"
            >
              <span className="text-base font-bold leading-none">+</span>
              <span>Nueva Cita</span>
            </button>
          </div>
        </header>
      </ViewPopup>

      {/* 2. Tarjetas de Estadísticas con efecto cascada (Staggered Pop-up) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

        {/* Card 2: Pendientes Prep. */}
        <ViewPopup delayMs={110}>
          <article className="bg-white rounded-2xl border border-border-tan shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 sm:p-5 flex flex-col justify-between transition hover:shadow-md h-full">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#fde8e8] text-[#c81e1e] flex items-center justify-center">
                <AlertClipboardIcon className="w-5 h-5" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#c81e1e] tracking-tight">
                {stats.pendientesPrep}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-500 mt-3 sm:mt-4">
              Pendientes Prep.
            </span>
          </article>
        </ViewPopup>

        {/* Card 3: Próximas */}
        <ViewPopup delayMs={150}>
          <article className="bg-white rounded-2xl border border-border-tan shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 sm:p-5 flex flex-col justify-between transition hover:shadow-md h-full">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#fef0e6] text-[#b45309] flex items-center justify-center">
                <ClockOutlineIcon className="w-5 h-5" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#78350f] tracking-tight">
                {stats.proximas}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-500 mt-3 sm:mt-4">
              Próximas
            </span>
          </article>
        </ViewPopup>

        {/* Card 4: Preparadas */}
        <ViewPopup delayMs={190}>
          <article className="bg-white rounded-2xl border border-border-tan shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 sm:p-5 flex flex-col justify-between transition hover:shadow-md h-full">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#e1f5ee] text-[#0f766e] flex items-center justify-center">
                <CheckCircleOutlineIcon className="w-5 h-5" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#143d36] tracking-tight">
                {stats.preparadas}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-500 mt-3 sm:mt-4">
              Preparadas
            </span>
          </article>
        </ViewPopup>
      </section>

      {/* 3. Sección "Citas de hoy" con Pop-up Effect */}
      <ViewPopup delayMs={230}>
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-brand tracking-tight">
              Citas de hoy
            </h2>

            {/* Filtros sutiles para interactividad */}
            <div className="flex items-center gap-1.5 bg-bone/90 p-1 rounded-xl border border-border-tan/80 text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus('TODAS')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  filterStatus === 'TODAS'
                    ? 'bg-white text-brand shadow-xs'
                    : 'text-sage hover:text-brand'
                }`}
              >
                Todas ({appointments.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('Pendiente')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  filterStatus === 'Pendiente'
                    ? 'bg-white text-[#c81e1e] shadow-xs'
                    : 'text-sage hover:text-brand'
                }`}
              >
                Pendientes ({appointments.filter((a) => a.status === 'Pendiente').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('Preparada')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  filterStatus === 'Preparada'
                    ? 'bg-white text-[#065f46] shadow-xs'
                    : 'text-sage hover:text-brand'
                }`}
              >
                Preparadas ({appointments.filter((a) => a.status === 'Preparada').length})
              </button>
            </div>
          </div>

          {/* Tabla de Citas con efecto Pop-up al filtrar */}
          <ViewPopup animationKey={filterStatus} className="w-full">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#dce9e3] text-[#34524a] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6 font-bold">HORA</th>
                      <th className="py-3.5 px-4 sm:px-5 font-bold">MASCOTA</th>
                      <th className="py-3.5 px-4 sm:px-5 font-bold">SERVICIO</th>
                      <th className="py-3.5 px-4 sm:px-5 font-bold">PROFESIONAL</th>
                      <th className="py-3.5 px-4 sm:px-5 font-bold">ESTADO</th>
                      <th className="py-3.5 px-4 sm:px-6 font-bold text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-tan/60 text-sm">
                    {filteredAppointments.length === 0 ? (
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
                              No hay citas con el estado seleccionado.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => {
                        const isPending = apt.status === 'Pendiente'
                        const isPrepared = apt.status === 'Preparada'
                        const avatarBg =
                          apt.avatarColor === 'peach'
                            ? 'bg-[#f09a82] text-white'
                            : 'bg-brand text-white'

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

                            {/* ESTADO */}
                            <td className="py-4 px-4 sm:px-5 whitespace-nowrap">
                              {isPending && (
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#eef2f6] text-slate-600">
                                  Pendiente
                                </span>
                              )}
                              {isPrepared && (
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#d1fae5] text-[#065f46]">
                                  Preparada
                                </span>
                              )}
                              {!isPending && !isPrepared && (
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-bone text-sage">
                                  {apt.status}
                                </span>
                              )}
                            </td>

                            {/* ACCIONES */}
                            <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                              <div className="inline-flex items-center justify-end gap-3">
                                {isPending ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenView(apt)}
                                      className="text-xs font-semibold text-charcoal hover:text-brand transition cursor-pointer"
                                    >
                                      Ver cita
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPrepare(apt)}
                                      className="px-3.5 py-1.5 rounded-lg bg-[#854d38] hover:bg-[#703d2a] active:scale-97 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                                    >
                                      Preparar
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenView(apt)}
                                    className="text-xs font-semibold text-charcoal hover:text-brand transition cursor-pointer"
                                  >
                                    Ver detalles
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </ViewPopup>
        </section>
      </ViewPopup>

      {/* DRAWER LATERAL: Preparar Paciente (desplegable tipo admin) */}
      <PrepararCitaDrawer
        isOpen={Boolean(prepAppointment)}
        appointment={prepAppointment}
        onClose={() => setPrepAppointment(null)}
        onSave={handleSavePreparation}
      />

      {/* DRAWER LATERAL: Ver Cita / Detalles (desplegable tipo admin) */}
      <DetalleCitaDrawer
        isOpen={Boolean(selectedAppointment)}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onPrepare={(apt) => {
          setSelectedAppointment(null)
          handleOpenPrepare(apt)
        }}
      />

      {/* DRAWER LATERAL: Nueva Cita (desplegable tipo admin) */}
      <NuevaCitaDrawer
        isOpen={isNewAppointmentDrawerOpen}
        onClose={() => setIsNewAppointmentDrawerOpen(false)}
        onSave={handleSaveNewAppointment}
      />

      {/* Notificación flotante / Toast */}
      {toastMessage &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)]">
            <div className="view-popup bg-brand text-white px-5 py-2.5 rounded-full shadow-lg text-xs sm:text-sm font-medium border border-white/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ochre animate-pulse shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </div>
          </div>,
          document.body
        )}
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

function AlertClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="12" y1="11" x2="12" y2="15" />
      <circle cx="12" cy="18" r="0.5" fill="currentColor" />
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
