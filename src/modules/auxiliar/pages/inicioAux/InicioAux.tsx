import { useState, useEffect, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import type { AuxDayAppointment, AuxStatSummary } from '../../types'
import { ViewPopup } from '../../components'

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

// ==========================================
// VISTA PRINCIPAL: InicioAux
// ==========================================
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

            {/* Filtros sutiles */}
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

      {/* DRAWER LATERAL: Preparar Paciente */}
      <PrepararCitaDrawer
        isOpen={Boolean(prepAppointment)}
        appointment={prepAppointment}
        onClose={() => setPrepAppointment(null)}
        onSave={handleSavePreparation}
      />

      {/* DRAWER LATERAL: Ver Cita / Detalles */}
      <DetalleCitaDrawer
        isOpen={Boolean(selectedAppointment)}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onPrepare={(apt) => {
          setSelectedAppointment(null)
          handleOpenPrepare(apt)
        }}
      />

      {/* DRAWER LATERAL: Nueva Cita */}
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

// Alias para compatibilidad
export const InicioAuxPage = InicioAux

// ==========================================
// DRAWER: Nueva Cita
// ==========================================
interface NuevaCitaDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newAppointment: AuxDayAppointment) => void
}

export function NuevaCitaDrawer({
  isOpen,
  onClose,
  onSave,
}: NuevaCitaDrawerProps) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)

  // Campos del formulario
  const [petName, setPetName] = useState('')
  const [species, setSpecies] = useState('Perro')
  const [breed, setBreed] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [service, setService] = useState('Consulta General')
  const [professional, setProfessional] = useState('Dra. Martínez')
  const [time, setTime] = useState('02:30 PM')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setPetName('')
      setSpecies('Perro')
      setBreed('')
      setOwnerName('')
      setOwnerPhone('')
      setService('Consulta General')
      setProfessional('Dra. Martínez')
      setTime('02:30 PM')
      setNotes('')
      setFormError(null)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsRendered(false)
      setIsClosing(false)
    }, 230)
  }

  if (!isRendered && !isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!petName.trim()) {
      setFormError('Por favor ingresa el nombre de la mascota.')
      return
    }

    if (!ownerName.trim()) {
      setFormError('Por favor ingresa el nombre del dueño o propietario.')
      return
    }

    const speciesBreedFormatted = breed.trim()
      ? `${species} / ${breed.trim()}`
      : species

    const newAppointment: AuxDayAppointment = {
      id: `apt-${Date.now()}`,
      time: time || '02:30 PM',
      petName: petName.trim(),
      petInitial: petName.trim().charAt(0).toUpperCase(),
      avatarColor: species.toLowerCase().includes('gato') ? 'brand' : 'peach',
      speciesBreed: speciesBreedFormatted,
      service,
      professional,
      status: 'Pendiente',
      ownerName: ownerPhone.trim() ? `${ownerName.trim()} (${ownerPhone.trim()})` : ownerName.trim(),
      notes: notes.trim() || undefined,
    }

    onSave(newAppointment)
    handleClose()
  }

  const drawerContent = (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-nueva-cita-title"
    >
      <div
        className={`w-full sm:w-[460px] lg:w-[500px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header fijo del Drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white">
          <div className="flex flex-col">
            <h2
              id="drawer-nueva-cita-title"
              className="text-xl sm:text-2xl font-bold text-brand tracking-tight"
            >
              Nueva Cita
            </h2>
            <p className="text-xs text-sage mt-0.5 font-medium">
              Programa una cita para atención y preparación clínica
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
            aria-label="Cerrar panel lateral"
          >
            <span className="text-xl font-medium leading-none">✕</span>
          </button>
        </div>

        {/* 2. Cuerpo del Formulario con scroll independiente */}
        <form
          id="nueva-cita-drawer-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5"
        >
          {formError && (
            <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {formError}
            </div>
          )}

          {/* Sección: Mascota */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
              Datos del Paciente
            </h3>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                Nombre de la Mascota <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Ej. Luna, Max, Thor..."
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                  Especie <span className="text-terracotta">*</span>
                </label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer shadow-2xs"
                >
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Ave">Ave</option>
                  <option value="Conejo">Conejo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                  Raza
                </label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="Ej. Golden, Mestizo..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Sección: Propietario */}
          <div className="space-y-3.5 pt-2">
            <h3 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
              Datos del Dueño
            </h3>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                Nombre del Dueño <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ej. Andrea Gómez"
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="Ej. +57 300 123 4567"
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>
          </div>

          {/* Sección: Servicio y Asignación */}
          <div className="space-y-3.5 pt-2">
            <h3 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
              Servicio y Profesional
            </h3>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                Servicio Clínico <span className="text-terracotta">*</span>
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer shadow-2xs"
              >
                <option value="Consulta General">Consulta General</option>
                <option value="Vacunación">Vacunación</option>
                <option value="Limpieza Dental">Limpieza Dental</option>
                <option value="Desparasitación">Desparasitación</option>
                <option value="Control Dermatológico">Control Dermatológico</option>
                <option value="Control Post-Quirúrgico">Control Post-Quirúrgico</option>
                <option value="Chequeo Preventivo">Chequeo Preventivo</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                  Profesional <span className="text-terracotta">*</span>
                </label>
                <select
                  value={professional}
                  onChange={(e) => setProfessional(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer shadow-2xs"
                >
                  <option value="Dra. Martínez">Dra. Martínez</option>
                  <option value="Dr. López">Dr. López</option>
                  <option value="Dr. Roberto Silva">Dr. Roberto Silva</option>
                  <option value="Dra. Ana Silva">Dra. Ana Silva</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                  Horario <span className="text-terracotta">*</span>
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer shadow-2xs"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:45 AM">09:45 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:15 AM">11:15 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:15 PM">03:15 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="04:45 PM">04:45 PM</option>
                  <option value="05:30 PM">05:30 PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Motivo y Triaje */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs sm:text-sm font-bold text-charcoal">
              Motivo de Consulta / Observaciones
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe síntomas preliminares, alergias conocidas o instrumental a requerir..."
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
            />
          </div>

          {/* Banner de Estado Inicial */}
          <div className="bg-[#f0f7f4] border border-[#d4ede4] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#1b4332]">
            <svg
              className="w-4 h-4 mt-0.5 shrink-0 text-[#0f766e]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="leading-relaxed">
              La cita se creará con estado <strong>Pendiente</strong> en la tabla del día para que el auxiliar realice la preparación de peso, temperatura e instrumental.
            </p>
          </div>
        </form>

        {/* 3. Footer fijo del Drawer */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 px-6 py-4 border-t border-border-tan/70 bg-white">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="nueva-cita-drawer-form"
            className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer active:translate-y-0.5"
          >
            Agendar Cita
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body)
  }

  return drawerContent
}

// ==========================================
// DRAWER: Preparar Paciente
// ==========================================
interface PrepararCitaDrawerProps {
  isOpen: boolean
  appointment: AuxDayAppointment | null
  onClose: () => void
  onSave: (
    appointmentId: string,
    data: { weight: string; temp: string; notes?: string }
  ) => void
}

export function PrepararCitaDrawer({
  isOpen,
  appointment,
  onClose,
  onSave,
}: PrepararCitaDrawerProps) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)

  // Campos de preparación
  const [weight, setWeight] = useState('12.5')
  const [temp, setTemp] = useState('38.4')
  const [heartRate, setHeartRate] = useState('110')
  const [notes, setNotes] = useState('')
  const [instrumentsReady, setInstrumentsReady] = useState(true)
  const [historyChecked, setHistoryChecked] = useState(true)
  const [petCalm, setPetCalm] = useState(true)

  useEffect(() => {
    if (isOpen && appointment) {
      setIsRendered(true)
      setIsClosing(false)
      setWeight('12.5')
      setTemp('38.4')
      setHeartRate('110')
      setNotes(appointment.notes || '')
      setInstrumentsReady(true)
      setHistoryChecked(true)
      setPetCalm(true)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [isOpen, appointment])

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsRendered(false)
      setIsClosing(false)
    }, 230)
  }

  if (!isRendered && !isOpen) return null
  if (!appointment) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const prepDetails = [
      notes.trim(),
      `Peso: ${weight}kg`,
      `Temp: ${temp}°C`,
      heartRate.trim() ? `FC: ${heartRate}lpm` : null,
      instrumentsReady ? 'Instrumental listo' : null,
    ]
      .filter(Boolean)
      .join(' | ')

    onSave(appointment.id, {
      weight,
      temp,
      notes: prepDetails,
    })

    handleClose()
  }

  const avatarBg =
    appointment.avatarColor === 'peach'
      ? 'bg-[#f09a82] text-white'
      : 'bg-brand text-white'

  const drawerContent = (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-preparar-cita-title"
    >
      <div
        className={`w-full sm:w-[460px] lg:w-[500px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Encabezado fijo del Drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white">
          <div className="flex flex-col">
            <h2
              id="drawer-preparar-cita-title"
              className="text-xl sm:text-2xl font-bold text-brand tracking-tight"
            >
              Preparar Paciente
            </h2>
            <p className="text-xs text-sage mt-0.5 font-medium">
              Triaje, registro de signos vitales e instrumental clínico
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
            aria-label="Cerrar panel de preparación"
          >
            <span className="text-xl font-medium leading-none">✕</span>
          </button>
        </div>

        {/* 2. Cuerpo del Formulario con scroll independiente */}
        <form
          id="preparar-cita-drawer-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5"
        >
          {/* Tarjeta de Resumen del Paciente */}
          <div className="bg-bone/60 border border-border-tan rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 shadow-xs ${avatarBg}`}
              >
                {appointment.petInitial || appointment.petName.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-charcoal text-base truncate">
                  {appointment.petName}
                </span>
                <span className="text-xs text-sage truncate">
                  {appointment.speciesBreed}
                </span>
                <span className="text-[11px] text-gray-500 truncate mt-0.5">
                  Dueño: {appointment.ownerName || 'No especificado'}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-brand border border-border-tan shadow-2xs">
                {appointment.time}
              </span>
              <p className="text-[11px] text-sage mt-1 font-medium">
                {appointment.professional}
              </p>
            </div>
          </div>

          {/* Sección: Signos Vitales */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
              Signos Vitales de Ingreso
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                  Peso (kg) <span className="text-terracotta">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ej. 12.5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                  Temperatura (°C) <span className="text-terracotta">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="45"
                  required
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="Ej. 38.5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                Frecuencia Cardíaca (lpm)
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="Ej. 110"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>
          </div>

          {/* Sección: Lista de Verificación de Preparación */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
              Checklist de Box y Paciente
            </h3>

            <label className="flex items-center gap-3 p-2.5 rounded-xl border border-border-tan/70 hover:bg-bone/40 transition cursor-pointer">
              <input
                type="checkbox"
                checked={instrumentsReady}
                onChange={(e) => setInstrumentsReady(e.target.checked)}
                className="w-4 h-4 rounded text-brand focus:ring-brand/30 border-border-tan"
              />
              <span className="text-xs font-medium text-charcoal">
                Instrumental esterilizado y preparado para {appointment.service}
              </span>
            </label>

            <label className="flex items-center gap-3 p-2.5 rounded-xl border border-border-tan/70 hover:bg-bone/40 transition cursor-pointer">
              <input
                type="checkbox"
                checked={historyChecked}
                onChange={(e) => setHistoryChecked(e.target.checked)}
                className="w-4 h-4 rounded text-brand focus:ring-brand/30 border-border-tan"
              />
              <span className="text-xs font-medium text-charcoal">
                Historial médico y vacunación previa revisados
              </span>
            </label>

            <label className="flex items-center gap-3 p-2.5 rounded-xl border border-border-tan/70 hover:bg-bone/40 transition cursor-pointer">
              <input
                type="checkbox"
                checked={petCalm}
                onChange={(e) => setPetCalm(e.target.checked)}
                className="w-4 h-4 rounded text-brand focus:ring-brand/30 border-border-tan"
              />
              <span className="text-xs font-medium text-charcoal">
                Mascota acondicionada y lista para ingreso con el profesional
              </span>
            </label>
          </div>

          {/* Sección: Observaciones de Triaje */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs sm:text-sm font-bold text-charcoal">
              Notas de Preparación y Triaje
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones de ingreso, comportamiento, medicación reciente o requerimientos especiales..."
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
            />
          </div>

          {/* Banner Informativo */}
          <div className="bg-[#f0f7f4] border border-[#d4ede4] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#1b4332]">
            <svg
              className="w-4 h-4 mt-0.5 shrink-0 text-[#0f766e]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="leading-relaxed">
              Al guardar, la cita cambiará a estado <strong>Preparada</strong> y se notificará al profesional <strong>{appointment.professional}</strong>.
            </p>
          </div>
        </form>

        {/* 3. Pie fijo del Drawer */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 px-6 py-4 border-t border-border-tan/70 bg-white">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="preparar-cita-drawer-form"
            className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#854d38] hover:bg-[#703d2a] active:scale-98 text-white transition shadow-xs cursor-pointer"
          >
            Guardar y Marcar Preparada
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body)
  }

  return drawerContent
}

// ==========================================
// DRAWER: Detalle de Cita
// ==========================================
interface DetalleCitaDrawerProps {
  isOpen: boolean
  appointment: AuxDayAppointment | null
  onClose: () => void
  onPrepare?: (appointment: AuxDayAppointment) => void
}

export function DetalleCitaDrawer({
  isOpen,
  appointment,
  onClose,
  onPrepare,
}: DetalleCitaDrawerProps) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen && appointment) {
      setIsRendered(true)
      setIsClosing(false)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [isOpen, appointment])

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsRendered(false)
      setIsClosing(false)
    }, 230)
  }

  if (!isRendered && !isOpen) return null
  if (!appointment) return null

  const isPending = appointment.status === 'Pendiente'
  const isPrepared = appointment.status === 'Preparada'
  const avatarBg =
    appointment.avatarColor === 'peach'
      ? 'bg-[#f09a82] text-white'
      : 'bg-brand text-white'

  const drawerContent = (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-detalle-cita-title"
    >
      <div
        className={`w-full sm:w-[460px] lg:w-[500px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header fijo del Drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white">
          <div className="flex flex-col">
            <h2
              id="drawer-detalle-cita-title"
              className="text-xl sm:text-2xl font-bold text-brand tracking-tight"
            >
              Detalle de la Cita
            </h2>
            <p className="text-xs text-sage mt-0.5 font-medium">
              Información clínica del paciente y asignación
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
            aria-label="Cerrar panel de detalle"
          >
            <span className="text-xl font-medium leading-none">✕</span>
          </button>
        </div>

        {/* 2. Cuerpo del Detalle con scroll independiente */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5">
          {/* Tarjeta Principal del Paciente */}
          <div className="bg-bone/50 border border-border-tan rounded-3xl p-5 flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-sm shrink-0 ${avatarBg}`}
            >
              {appointment.petInitial || appointment.petName.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-charcoal truncate">
                  {appointment.petName}
                </h3>
                {isPending && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eef2f6] text-slate-600 shrink-0">
                    Pendiente
                  </span>
                )}
                {isPrepared && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d1fae5] text-[#065f46] shrink-0">
                    Preparada
                  </span>
                )}
              </div>
              <p className="text-xs text-sage font-medium truncate">
                {appointment.speciesBreed}
              </p>
            </div>
          </div>

          {/* Grilla de Datos de la Cita */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
              Información de Atención
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bone/40 p-3.5 rounded-2xl border border-border-tan/60">
                <span className="text-[11px] font-bold text-sage block uppercase tracking-wider mb-0.5">
                  Horario Programado
                </span>
                <span className="font-bold text-charcoal text-sm">
                  {appointment.time}
                </span>
              </div>

              <div className="bg-bone/40 p-3.5 rounded-2xl border border-border-tan/60">
                <span className="text-[11px] font-bold text-sage block uppercase tracking-wider mb-0.5">
                  Servicio
                </span>
                <span className="font-bold text-charcoal text-sm truncate block">
                  {appointment.service}
                </span>
              </div>

              <div className="bg-bone/40 p-3.5 rounded-2xl border border-border-tan/60 col-span-2">
                <span className="text-[11px] font-bold text-sage block uppercase tracking-wider mb-0.5">
                  Profesional Veterinario
                </span>
                <span className="font-bold text-charcoal text-sm">
                  {appointment.professional}
                </span>
              </div>
            </div>
          </div>

          {/* Datos del Dueño */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
              Datos del Propietario
            </h4>

            <div className="bg-bone/40 p-3.5 rounded-2xl border border-border-tan/60 space-y-2">
              <div>
                <span className="text-[11px] font-bold text-sage block uppercase tracking-wider mb-0.5">
                  Nombre del Responsable
                </span>
                <span className="font-semibold text-charcoal text-sm">
                  {appointment.ownerName || 'No especificado'}
                </span>
              </div>
            </div>
          </div>

          {/* Notas Clínicas / Motivo */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
              Observaciones y Notas de Triaje
            </h4>

            <div className="p-4 rounded-2xl bg-bone/40 border border-border-tan/60">
              <p className="text-xs sm:text-sm text-charcoal leading-relaxed">
                {appointment.notes ||
                  'Sin notas clínicas adicionales registradas para este turno.'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Footer fijo del Drawer */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 px-6 py-4 border-t border-border-tan/70 bg-white">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer"
          >
            Cerrar
          </button>

          {isPending && onPrepare && (
            <button
              type="button"
              onClick={() => {
                handleClose()
                setTimeout(() => {
                  onPrepare(appointment)
                }, 240)
              }}
              className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#854d38] hover:bg-[#703d2a] active:scale-98 text-white transition shadow-xs cursor-pointer"
            >
              Preparar Paciente
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body)
  }

  return drawerContent
}

// ==========================================
// ICONOS LOCALES
// ==========================================
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
