import { useState, useMemo } from 'react'
import type { AuxDayAppointment } from '../../types'
import {
  ViewPopup,
  NuevaCitaDrawer,
  PrepararCitaDrawer,
  DetalleCitaDrawer,
  CustomSelect,
} from '../../components'

export interface AgendaAuxProps {
  userName?: string
  onNotice?: (message: string) => void
  onNewAppointment?: () => void
}

interface AgendaAppointmentItem {
  id: string
  dateKey: string // YYYY-MM-DD
  startTime: string // "09:00"
  endTime: string // "09:30"
  status: 'Agendado' | 'Atendido' | 'Cancelado' | 'Preparada' | 'Pendiente'
  petName: string
  petBreed: string
  species: string
  ownerName: string
  professional: string
  service: string
  notes?: string
}

interface DayColumn {
  label: string
  num: number
  dateKey: string
  isToday?: boolean
}

const WEEKS_DATA = [
  {
    weekLabel: 'Oct 16 - Oct 22',
    days: [
      { label: 'LUN', num: 16, dateKey: '2023-10-16' },
      { label: 'MAR', num: 17, dateKey: '2023-10-17', isToday: true },
      { label: 'MIÉ', num: 18, dateKey: '2023-10-18' },
      { label: 'JUE', num: 19, dateKey: '2023-10-19' },
      { label: 'VIE', num: 20, dateKey: '2023-10-20' },
      { label: 'SÁB', num: 21, dateKey: '2023-10-21' },
      { label: 'DOM', num: 22, dateKey: '2023-10-22' },
    ] as DayColumn[],
  },
  {
    weekLabel: 'Oct 23 - Oct 29',
    days: [
      { label: 'LUN', num: 23, dateKey: '2023-10-23' },
      { label: 'MAR', num: 24, dateKey: '2023-10-24' },
      { label: 'MIÉ', num: 25, dateKey: '2023-10-25' },
      { label: 'JUE', num: 26, dateKey: '2023-10-26' },
      { label: 'VIE', num: 27, dateKey: '2023-10-27' },
      { label: 'SÁB', num: 28, dateKey: '2023-10-28' },
      { label: 'DOM', num: 29, dateKey: '2023-10-29' },
    ] as DayColumn[],
  },
]

const INITIAL_AGENDA_ITEMS: AgendaAppointmentItem[] = [
  {
    id: 'apt-lun-1',
    dateKey: '2023-10-16',
    startTime: '09:00',
    endTime: '09:30',
    status: 'Atendido',
    petName: 'Max',
    petBreed: 'Golden Retriever',
    species: 'Perro',
    ownerName: 'Carlos Morales',
    professional: 'Dra. Martínez',
    service: 'Vacunación',
    notes: 'Vacuna séxtuple aplicada con éxito. Paciente estable.',
  },
  {
    id: 'apt-mar-1',
    dateKey: '2023-10-17',
    startTime: '11:00',
    endTime: '11:45',
    status: 'Agendado',
    petName: 'Luna',
    petBreed: 'Gato Siamés',
    species: 'Gato',
    ownerName: 'Ana S.',
    professional: 'Dra. Martínez',
    service: 'Control General',
    notes: 'Revisión semestral preventiva y pesaje.',
  },
  {
    id: 'apt-mar-2',
    dateKey: '2023-10-17',
    startTime: '14:00',
    endTime: '15:00',
    status: 'Agendado',
    petName: 'Toby',
    petBreed: 'Beagle',
    species: 'Perro',
    ownerName: 'Luis F.',
    professional: 'Dr. Roberto Silva',
    service: 'Retiro de Puntos',
    notes: 'Retiro de sutura postoperatoria en extremidad posterior derecha.',
  },
  {
    id: 'apt-mie-1',
    dateKey: '2023-10-18',
    startTime: '10:00',
    endTime: '10:30',
    status: 'Cancelado',
    petName: 'Coco',
    petBreed: 'Poodle',
    species: 'Perro',
    ownerName: 'Mariana Ríos',
    professional: 'Dr. López',
    service: 'Desparasitación',
    notes: 'Cancelado por el dueño con 24h de anticipación.',
  },
  {
    id: 'apt-jue-1',
    dateKey: '2023-10-19',
    startTime: '09:30',
    endTime: '10:15',
    status: 'Agendado',
    petName: 'Simba',
    petBreed: 'Persa',
    species: 'Gato',
    ownerName: 'Sofía Valenzuela',
    professional: 'Dr. López',
    service: 'Control Dermatológico',
    notes: 'Chequeo de piel y pelaje por alergia estacional.',
  },
  {
    id: 'apt-vie-1',
    dateKey: '2023-10-20',
    startTime: '11:30',
    endTime: '12:30',
    status: 'Agendado',
    petName: 'Rocky',
    petBreed: 'Bulldog Francés',
    species: 'Perro',
    ownerName: 'Javier Castillo',
    professional: 'Dra. Martínez',
    service: 'Limpieza Dental',
    notes: 'Preparación previa con ayuno de 8 horas verificado.',
  },
]

export function AgendaAux({ onNotice }: AgendaAuxProps) {
  const [weekIndex, setWeekIndex] = useState(0)
  const [selectedProfessional, setSelectedProfessional] = useState('Todos los profesionales')
  const [appointments, setAppointments] = useState<AgendaAppointmentItem[]>(INITIAL_AGENDA_ITEMS)

  // Modales / Drawers
  const [selectedAppointment, setSelectedAppointment] = useState<AuxDayAppointment | null>(null)
  const [prepAppointment, setPrepAppointment] = useState<AuxDayAppointment | null>(null)
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)

  const currentWeek = WEEKS_DATA[weekIndex] || WEEKS_DATA[0]

  const professionals = [
    'Todos los profesionales',
    'Dra. Martínez',
    'Dr. López',
    'Dr. Roberto Silva',
    'Dra. Ana Silva',
  ]

  const handlePrevWeek = () => {
    setWeekIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextWeek = () => {
    setWeekIndex((prev) => Math.min(WEEKS_DATA.length - 1, prev + 1))
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (
        selectedProfessional !== 'Todos los profesionales' &&
        apt.professional !== selectedProfessional
      ) {
        return false
      }
      return true
    })
  }, [appointments, selectedProfessional])

  const handleCardClick = (apt: AgendaAppointmentItem) => {
    const auxApt: AuxDayAppointment = {
      id: apt.id,
      time: `${apt.startTime} - ${apt.endTime}`,
      petName: apt.petName,
      petInitial: apt.petName.charAt(0).toUpperCase(),
      avatarColor: apt.species.toLowerCase().includes('gato') ? 'brand' : 'peach',
      speciesBreed: `${apt.species} / ${apt.petBreed}`,
      service: apt.service,
      professional: apt.professional,
      status: apt.status === 'Atendido' || apt.status === 'Preparada' ? 'Preparada' : 'Pendiente',
      ownerName: apt.ownerName,
      notes: apt.notes,
    }
    setSelectedAppointment(auxApt)
  }

  const handlePrepareFromDetail = (auxApt: AuxDayAppointment) => {
    setSelectedAppointment(null)
    setPrepAppointment(auxApt)
  }

  const handleSavePreparation = (
    appointmentId: string,
    data: { weight: string; temp: string; notes?: string }
  ) => {
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
    setPrepAppointment(null)
    onNotice?.('¡Paciente preparado y marcado como listo para el veterinario!')
  }

  const handleSaveNewAppointment = (newApt: AuxDayAppointment) => {
    const timeParts = newApt.time.split(' ')
    const startTime = timeParts[0] || '10:00'

    const newItem: AgendaAppointmentItem = {
      id: newApt.id,
      dateKey: currentWeek.days[1]?.dateKey || '2023-10-17',
      startTime: startTime,
      endTime: '11:00',
      status: 'Agendado',
      petName: newApt.petName,
      petBreed: newApt.speciesBreed,
      species: newApt.speciesBreed.includes('Gato') ? 'Gato' : 'Perro',
      ownerName: newApt.ownerName || 'Propietario',
      professional: newApt.professional,
      service: newApt.service,
      notes: newApt.notes,
    }

    setAppointments((prev) => [newItem, ...prev])
    onNotice?.(`¡Cita agendada para ${newApt.petName} exitosamente!`)
  }

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6 min-w-0">
      {/* 1. Header de la Agenda */}
      <ViewPopup delayMs={20} className="relative z-30">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
              Agenda Semanal
            </h1>
            <p className="text-xs sm:text-sm text-sage font-medium mt-0.5">
              Revisa las próximas citas para preparar a los pacientes.
            </p>
          </div>

          {/* Controles: Selector de profesional + Navegación de semana */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Dropdown estilizado de profesional */}
            <div className="w-56 sm:w-60">
              <CustomSelect
                value={selectedProfessional}
                onChange={setSelectedProfessional}
                options={professionals}
                menuClassName="w-60"
              />
            </div>

            {/* Paginador de semana */}
            <div className="flex items-center bg-white border border-border-tan rounded-2xl p-1 shadow-xs">
              <button
                type="button"
                onClick={handlePrevWeek}
                disabled={weekIndex === 0}
                className="p-1.5 rounded-xl text-charcoal hover:bg-bone disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Semana anterior"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="px-3 text-xs sm:text-sm font-bold text-brand whitespace-nowrap">
                {currentWeek.weekLabel}
              </span>

              <button
                type="button"
                onClick={handleNextWeek}
                disabled={weekIndex === WEEKS_DATA.length - 1}
                className="p-1.5 rounded-xl text-charcoal hover:bg-bone disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Semana siguiente"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </header>
      </ViewPopup>

      {/* 2. Grid de la Agenda Semanal */}
      <ViewPopup delayMs={80} animationKey={`${weekIndex}-${selectedProfessional}`} className="w-full">
        <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Cabecera de los 7 Días */}
          <div className="grid grid-cols-7 border-b border-border-tan/80 text-center bg-[#fdfcfb]">
            {currentWeek.days.map((day) => {
              const isToday = day.isToday
              return (
                <div
                  key={day.dateKey}
                  className={`py-3.5 px-1 sm:px-2 flex flex-col items-center justify-center border-r last:border-r-0 border-border-tan/60 ${
                    isToday ? 'bg-brand/5' : ''
                  }`}
                >
                  <span
                    className={`text-[11px] sm:text-xs font-bold tracking-wider uppercase ${
                      isToday ? 'text-brand' : 'text-sage'
                    }`}
                  >
                    {day.label}
                  </span>
                  <span
                    className={`text-base sm:text-lg font-extrabold mt-0.5 ${
                      isToday ? 'text-brand font-black' : 'text-charcoal'
                    }`}
                  >
                    {day.num}
                  </span>
                  {isToday && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1 shadow-xs" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Área del Calendario / Columnas de Citas */}
          <div className="grid grid-cols-7 min-h-[500px] sm:min-h-[560px] divide-x divide-border-tan/60 bg-white relative">
            {currentWeek.days.map((day) => {
              const dayAppointments = filteredAppointments.filter(
                (apt) => apt.dateKey === day.dateKey
              )
              const isToday = day.isToday

              return (
                <div
                  key={day.dateKey}
                  className={`p-1.5 sm:p-2.5 flex flex-col gap-2.5 relative ${
                    isToday ? 'bg-brand/[0.015]' : ''
                  }`}
                >
                  {/* Línea horizontal de hora actual (solo para el día actual) */}
                  {isToday && (
                    <div
                      className="absolute left-0 right-0 top-[28%] z-10 flex items-center pointer-events-none"
                      title="Hora actual"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1b4332] -ml-1 border-2 border-white shadow-xs" />
                      <div className="h-[2px] w-full bg-[#1b4332]/70" />
                    </div>
                  )}

                  {/* Tarjetas de Citas del Día */}
                  {dayAppointments.map((apt) => {
                    const isAtendido = apt.status === 'Atendido'
                    const isCancelado = apt.status === 'Cancelado'
                    const isAgendado = apt.status === 'Agendado' || apt.status === 'Pendiente'
                    const isPreparada = apt.status === 'Preparada'

                    // Estilo de la píldora de estado
                    let statusBadgeClass = 'bg-[#eef2f6] text-slate-600'
                    if (isAtendido) statusBadgeClass = 'bg-[#fbe8e4] text-[#854d38]'
                    if (isCancelado) statusBadgeClass = 'bg-[#fde8e8] text-[#c81e1e]'
                    if (isPreparada) statusBadgeClass = 'bg-[#d1fae5] text-[#065f46]'

                    // Borde lateral temático
                    let borderLeftClass = 'border-l-4 border-l-brand'
                    if (isAtendido) borderLeftClass = 'border-l-4 border-l-[#854d38]'
                    if (isCancelado) borderLeftClass = 'border-l-4 border-l-danger/60'
                    if (isPreparada) borderLeftClass = 'border-l-4 border-l-emerald-600'

                    return (
                      <div
                        key={apt.id}
                        onClick={() => handleCardClick(apt)}
                        className={`group bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-border-tan/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-brand/40 transition-all duration-200 cursor-pointer flex flex-col gap-1.5 relative ${borderLeftClass} ${
                          isCancelado ? 'opacity-70 bg-gray-50/50' : ''
                        }`}
                      >
                        {/* Horario y Estado */}
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="text-[11px] sm:text-xs font-bold text-charcoal">
                            {apt.startTime}
                            <span className="text-[10px] text-sage font-normal mx-0.5">-</span>
                            {apt.endTime}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadgeClass}`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        {/* Mascota y Especie */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-extrabold text-charcoal group-hover:text-brand transition truncate">
                            {apt.petName}{' '}
                            <span className="text-[11px] font-normal text-sage">
                              ({apt.petBreed.slice(0, 10)}...)
                            </span>
                          </span>

                          <span className="text-[11px] text-gray-500 truncate mt-0.5">
                            Dueño: {apt.ownerName}
                          </span>
                        </div>

                        {/* Tag de Servicio Clínico con Ícono */}
                        <div className="mt-1 pt-1.5 border-t border-border-tan/50 flex items-center gap-1.5 text-[11px] font-semibold text-brand/90 bg-[#f9f8f6] px-2 py-1 rounded-lg">
                          <ServiceTagIcon serviceName={apt.service} className="w-3.5 h-3.5 shrink-0 text-brand" />
                          <span className="truncate">{apt.service}</span>
                        </div>
                      </div>
                    )
                  })}

                  {/* Espacio en blanco interactivo para agendar */}
                  {dayAppointments.length === 0 && (
                    <div className="h-full min-h-[140px] flex items-center justify-center rounded-xl hover:bg-bone/40 transition-colors p-2 text-center">
                      <span className="text-[11px] text-sage/70 font-medium select-none">
                        Sin citas
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </ViewPopup>

      {/* 3. Drawers integrados para acciones */}
      <DetalleCitaDrawer
        isOpen={Boolean(selectedAppointment)}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onPrepare={handlePrepareFromDetail}
      />

      <PrepararCitaDrawer
        isOpen={Boolean(prepAppointment)}
        appointment={prepAppointment}
        onClose={() => setPrepAppointment(null)}
        onSave={handleSavePreparation}
      />

      <NuevaCitaDrawer
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        onSave={handleSaveNewAppointment}
      />
    </div>
  )
}

// Icono contextual según el servicio
function ServiceTagIcon({
  serviceName,
  className,
}: {
  serviceName: string
  className?: string
}) {
  const s = serviceName.toLowerCase()

  if (s.includes('vacun')) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  }

  if (s.includes('puntos') || s.includes('quir')) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="6" cy="6" r="3" strokeWidth={2} />
        <circle cx="6" cy="18" r="3" strokeWidth={2} />
        <line x1="20" y1="4" x2="8.12" y2="15.88" strokeWidth={2} strokeLinecap="round" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" strokeWidth={2} strokeLinecap="round" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" strokeWidth={2} strokeLinecap="round" />
      </svg>
    )
  }

  if (s.includes('limpieza') || s.includes('dental')) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )
  }

  // Ícono default: Maletín / Consulta
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" strokeWidth={2} />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" strokeWidth={2} />
    </svg>
  )
}
