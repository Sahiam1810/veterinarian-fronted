import { useMemo, useState, type ReactNode } from 'react'
import {
  CalendarIcon,
  EditIcon,
  PawIcon,
  SearchIcon,
  StethoscopeIcon,
} from '@/global/components'
import type { RecepAgendaDayAppointment } from '../types'
import { isRecepAppointmentEditable } from '../types'
import { RecepAppointmentStatusBadge } from './RecepAppointmentStatusBadge'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './RecepMascotasIcons'

interface RecepDayCalendarPanelProps {
  isOpen: boolean
  title: string
  dateValue: string
  appointments: RecepAgendaDayAppointment[]
  isLoading?: boolean
  onClose: () => void
  onChangeDate: (dateValue: string) => void
  onEditAppointment: (appointment: RecepAgendaDayAppointment) => void
}

const HOUR_START = 8
const HOUR_END = 18
// Escala alta: 30 min ≈ 90px brutos para que quepan 3 líneas legibles
const PX_PER_HOUR = 180
const EVENT_GAP_PX = 14

function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

function shiftIsoDate(dateValue: string, deltaDays: number): string {
  const [year, month, day] = dateValue.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + deltaDays)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function todayIsoDateLocal(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function eventTone(status: RecepAgendaDayAppointment['status']): string {
  const tones: Record<RecepAgendaDayAppointment['status'], string> = {
    AGENDADO: 'bg-brand/90 border-brand text-white',
    'EN CONSULTORIO': 'bg-ochre border-ochre text-charcoal',
    ATENDIDO: 'bg-sage-soft border-sage/40 text-brand',
    CANCELADO: 'bg-terracotta-soft border-terracotta/30 text-terracotta line-through',
  }
  return tones[status]
}

// Calendario flotante estilo día (Google Calendar): búsqueda, detalle y edición
export function RecepDayCalendarPanel({
  isOpen,
  title,
  dateValue,
  appointments,
  isLoading = false,
  onClose,
  onChangeDate,
  onEditAppointment,
}: RecepDayCalendarPanelProps) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i),
    [],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return appointments
    return appointments.filter((item) => {
      const haystack = [
        item.petName,
        item.breed,
        item.ownerName,
        item.professionalName,
        item.service,
        item.time,
        item.status,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [appointments, search])

  const selected = useMemo(() => {
    if (!selectedId) return null
    return appointments.find((item) => item.id === selectedId) ?? null
  }, [appointments, selectedId])

  const gridHeight = (HOUR_END - HOUR_START) * PX_PER_HOUR

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 cursor-pointer"
        aria-label="Cerrar calendario"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recep-day-calendar-title"
        className="view-popup relative z-10 w-full max-w-6xl h-[min(52rem,calc(100vh-1.25rem))] overflow-hidden rounded-2xl border border-border-tan bg-white shadow-[0_16px_48px_rgba(35,78,70,0.2)] flex flex-col"
      >
        <header className="shrink-0 border-b border-border-tan bg-white px-3 sm:px-4 py-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-brand text-white inline-flex items-center justify-center shrink-0">
                <CalendarIcon className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h2
                  id="recep-day-calendar-title"
                  className="text-sm sm:text-base font-extrabold text-brand tracking-tight"
                >
                  Agenda del día
                </h2>
                <p className="text-xs text-sage font-medium capitalize truncate">{title}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onChangeDate(shiftIsoDate(dateValue, -1))}
                className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center"
                aria-label="Día anterior"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onChangeDate(todayIsoDateLocal())}
                className="hidden sm:inline-flex px-2.5 h-8 rounded-lg border border-border-tan text-[11px] font-bold text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer items-center"
              >
                Hoy
              </button>
              <input
                type="date"
                value={dateValue}
                onChange={(event) => onChangeDate(event.target.value)}
                className="h-8 rounded-lg border border-border-tan bg-bone/50 px-2 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20"
                aria-label="Cambiar fecha"
              />
              <button
                type="button"
                onClick={() => onChangeDate(shiftIsoDate(dateValue, 1))}
                className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center"
                aria-label="Día siguiente"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center"
                aria-label="Cerrar"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <label className="relative w-full min-w-0">
            <span className="sr-only">Buscar citas</span>
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sage pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por mascota, dueño, servicio, profesional..."
              className="w-full rounded-xl border border-border-tan bg-bone/40 pl-9 pr-3 py-2 text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition"
            />
          </label>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden bg-white">
            {isLoading ? (
              <p className="text-sm text-sage font-medium px-4 py-8 text-center">
                Cargando agenda…
              </p>
            ) : (
              <div className="relative min-w-0" style={{ height: gridHeight }}>
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: '3.25rem 1fr' }}>
                  <div className="relative border-r border-border-tan/70 bg-bone/30">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="relative border-b border-border-tan/40"
                        style={{ height: PX_PER_HOUR }}
                      >
                        <span className="absolute top-0 right-1.5 -translate-y-1/2 text-[10px] font-semibold text-sage tabular-nums">
                          {String(hour).padStart(2, '0')}:00
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="relative">
                    {hours.map((hour) => (
                      <div
                        key={`line-${hour}`}
                        className="border-b border-border-tan/40"
                        style={{ height: PX_PER_HOUR }}
                      />
                    ))}

                    {filtered.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-sm text-sage font-medium bg-white/90 px-3 py-1.5 rounded-lg border border-border-tan">
                          {search.trim()
                            ? 'Sin resultados para la búsqueda'
                            : 'No hay citas en este día'}
                        </p>
                      </div>
                    )}

                    {filtered.map((appointment) => {
                      const start = parseMinutes(appointment.time) - HOUR_START * 60
                      const end = parseMinutes(appointment.endTime) - HOUR_START * 60
                      const durationMinutes = Math.max(end - start, 30)
                      const slotHeight = (durationMinutes / 60) * PX_PER_HOUR
                      // Separación entre citas; altura mínima para texto legible
                      const topPx = (Math.max(start, 0) / 60) * PX_PER_HOUR + EVENT_GAP_PX / 2
                      const heightPx = Math.max(slotHeight - EVENT_GAP_PX, 72)
                      const selectedCard = selectedId === appointment.id
                      const showOwner = heightPx >= 78

                      return (
                        <button
                          key={appointment.id}
                          type="button"
                          onClick={() => setSelectedId(appointment.id)}
                          className={`absolute left-2 right-3 sm:left-3 sm:right-4 rounded-xl border px-3 py-2.5 text-left shadow-sm transition cursor-pointer overflow-hidden box-border ${eventTone(
                            appointment.status,
                          )} ${selectedCard ? 'ring-2 ring-offset-1 ring-brand/50 z-10' : 'hover:brightness-105'}`}
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                          }}
                          title={`${appointment.time} ${appointment.petName} · ${appointment.service}`}
                        >
                          <span className="block text-sm font-extrabold truncate leading-5">
                            {appointment.time} · {appointment.petName}
                          </span>
                          <span className="block text-xs font-semibold truncate leading-5 mt-0.5 opacity-95">
                            {appointment.service}
                          </span>
                          {showOwner && (
                            <span className="block text-[11px] font-medium truncate leading-4 mt-0.5 opacity-90">
                              {appointment.ownerName}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="w-full lg:w-[320px] xl:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-border-tan bg-bone/40 min-h-0 overflow-y-auto overflow-x-hidden">
            {!selected ? (
              <div className="h-full min-h-[12rem] flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
                <span className="w-12 h-12 rounded-full bg-sage-soft text-brand inline-flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </span>
                <p className="text-sm font-bold text-charcoal">Selecciona una cita</p>
                <p className="text-xs text-sage font-medium leading-snug max-w-[16rem]">
                  Haz clic en un bloque del calendario para ver el detalle completo.
                </p>
                <p className="text-[11px] text-sage font-medium mt-2">
                  {filtered.length} cita{filtered.length === 1 ? '' : 's'} visible
                  {filtered.length === 1 ? '' : 's'}
                </p>
              </div>
            ) : (
              <AppointmentDetail
                appointment={selected}
                onClear={() => setSelectedId(null)}
                onEdit={() => onEditAppointment(selected)}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

function AppointmentDetail({
  appointment,
  onClear,
  onEdit,
}: {
  appointment: RecepAgendaDayAppointment
  onClear: () => void
  onEdit: () => void
}) {
  const canEdit = isRecepAppointmentEditable(appointment.status)

  return (
    <div className="p-4 flex flex-col gap-3 min-h-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-sage">Detalle</p>
          <h3 className="text-lg font-extrabold text-brand tracking-tight truncate">
            {appointment.petName}
          </h3>
          <p className="text-xs text-sage font-medium">{appointment.breed}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand transition cursor-pointer inline-flex items-center justify-center shrink-0"
          aria-label="Cerrar detalle"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <RecepAppointmentStatusBadge status={appointment.status} />

      <div className="rounded-xl border border-border-tan bg-white p-3 flex flex-col gap-2.5">
        <DetailLine
          icon={<CalendarIcon className="w-3.5 h-3.5" />}
          label="Horario"
          value={`${appointment.time} – ${appointment.endTime}`}
        />
        <DetailLine
          icon={<PawIcon className="w-3.5 h-3.5" />}
          label="Dueño"
          value={
            appointment.ownerPhone
              ? `${appointment.ownerName} · ${appointment.ownerPhone}`
              : appointment.ownerName
          }
        />
        <DetailLine
          icon={<StethoscopeIcon className="w-3.5 h-3.5" />}
          label="Servicio"
          value={`${appointment.service} · ${appointment.professionalName}`}
        />
      </div>

      {appointment.notes && (
        <div className="rounded-xl bg-cream/80 border border-border-tan px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-sage">Notas</p>
          <p className="text-xs text-charcoal font-medium mt-0.5 leading-snug">
            {appointment.notes}
          </p>
        </div>
      )}

      {canEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-4 py-2.5 text-sm font-bold hover:bg-brand-hover transition cursor-pointer"
        >
          <EditIcon className="w-4 h-4" />
          <span>Editar cita</span>
        </button>
      ) : (
        <p className="mt-auto text-[11px] text-sage font-medium text-center px-2 py-2 rounded-xl border border-dashed border-border-tan bg-white">
          Esta cita ya está {appointment.status === 'ATENDIDO' ? 'completada' : 'cancelada'} y
          no se puede editar.
        </p>
      )}
    </div>
  )
}

function DetailLine({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="w-7 h-7 rounded-lg bg-sage-soft text-brand inline-flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-sage">{label}</p>
        <p className="text-xs font-semibold text-charcoal leading-snug break-words">{value}</p>
      </div>
    </div>
  )
}
