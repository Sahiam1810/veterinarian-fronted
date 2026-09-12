import { useState, useEffect, useMemo, type FormEvent } from 'react'
import type {
  CitaSuperAdmin,
  CitaFormData,
  EstadoCita,
  AgendaPetOption,
  AgendaServiceOption,
} from '../types'
import {
  CONSULTORIOS_DISPONIBLES,
  HORARIO_APERTURA,
  HORARIO_CIERRE,
} from '../types'
import { CalendarIcon } from '@/global/components'
import { ProfessionalCombobox } from './ProfessionalCombobox'
import { isAppointmentDateInThePast, PAST_APPOINTMENT_MESSAGE } from '../utils/appointmentDateGuard'

export interface CitaDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CitaFormData) => Promise<void> | void
  editingCita: CitaSuperAdmin | null
  mascotasOpciones: AgendaPetOption[]
  profesionalesOpciones: { id: string; name: string }[]
  serviciosOpciones: AgendaServiceOption[]
  existingCitas?: CitaSuperAdmin[]
  defaultProfessionalId?: string
}

// Fecha local (no UTC) para el min del input date — evita el desfase de día en zonas UTC negativas.
function todayIsoDateLocal(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseMinutes(time: string): number {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function checkIntervalOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const sA = parseMinutes(startA)
  const eA = parseMinutes(endA)
  const sB = parseMinutes(startB)
  const eB = parseMinutes(endB)
  return sA < eB && eA > sB
}

export function CitaDrawer({
  isOpen,
  onClose,
  onSave,
  editingCita,
  mascotasOpciones,
  profesionalesOpciones,
  serviciosOpciones,
  existingCitas = [],
  defaultProfessionalId,
}: CitaDrawerProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [clientPetId, setClientPetId] = useState('')
  const [dateKey, setDateKey] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('09:00')
  const [professionalId, setProfessionalId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [consultorio, setConsultorio] = useState<string>('Consultorio 1')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<EstadoCita>('AGENDADA')

  useEffect(() => {
    if (!isOpen) return

    setError(null)
    setIsSubmitting(false)

    if (editingCita) {
      setClientPetId(editingCita.clientPetId || mascotasOpciones[0]?.clientPetId || '')
      setDateKey(editingCita.dateKey)
      setStartTime(editingCita.startTime)
      setEndTime(editingCita.endTime)
      setProfessionalId(editingCita.professionalId || profesionalesOpciones[0]?.id || '')
      setServiceId(editingCita.serviceId || serviciosOpciones[0]?.id || '')
      setConsultorio(editingCita.consultorio || 'Consultorio 1')
      setNotes(editingCita.notes || '')
      setStatus(editingCita.status)
    } else {
      const today = new Date().toISOString().slice(0, 10)
      setClientPetId(mascotasOpciones[0]?.clientPetId || '')
      setDateKey(today)
      setStartTime('08:00')
      setEndTime('09:00')
      setProfessionalId(defaultProfessionalId || profesionalesOpciones[0]?.id || '')
      setServiceId(serviciosOpciones[0]?.id || '')
      setConsultorio('Consultorio 1')
      setNotes('')
      setStatus('AGENDADA')
    }
  }, [isOpen, editingCita, mascotasOpciones, profesionalesOpciones, serviciosOpciones, defaultProfessionalId])

  const selectedPet = useMemo(
    () => mascotasOpciones.find((m) => m.clientPetId === clientPetId) || null,
    [mascotasOpciones, clientPetId],
  )

  // Buscador combinado por mascota o dueño (mismo combobox de S28/S31/S34).
  const mascotasPetOwnerOpciones = useMemo(
    () =>
      mascotasOpciones.map((m) => ({
        id: m.clientPetId,
        name: m.petName,
        subtitle: `Dueño: ${m.ownerName}`,
      })),
    [mascotasOpciones],
  )

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 240)
  }

  const validate = (): string | null => {
    if (!clientPetId) {
      return 'Debes seleccionar exactamente una mascota para la cita.'
    }
    if (!dateKey) {
      return 'Debes seleccionar una fecha válida.'
    }
    if (!startTime || !endTime) {
      return 'Debes especificar la hora de inicio y fin.'
    }

    // 1. Regla: Horario permitido 07:00 a 17:00
    const startMins = parseMinutes(startTime)
    const endMins = parseMinutes(endTime)
    const openMins = parseMinutes(HORARIO_APERTURA) // 420 (07:00)
    const closeMins = parseMinutes(HORARIO_CIERRE) // 1020 (17:00)

    if (startMins < openMins || endMins > closeMins) {
      return `El horario permitido para citas es exclusivamente de ${HORARIO_APERTURA} a ${HORARIO_CIERRE} (7:00 AM a 5:00 PM).`
    }

    if (startMins >= endMins) {
      return 'La hora de inicio debe ser anterior a la hora de fin.'
    }

    // S36: ni agendar ni reprogramar hacia una fecha/hora que ya pasó.
    if (isAppointmentDateInThePast(dateKey, startTime)) {
      return PAST_APPOINTMENT_MESSAGE
    }

    if (!professionalId) {
      return 'Debes seleccionar un médico veterinario.'
    }
    if (!serviceId) {
      return 'Debes seleccionar un servicio.'
    }
    if (!consultorio) {
      return 'Debes asignar un consultorio.'
    }

    // Filtra citas activas del mismo día excluyendo la que se está editando
    const sameDayActiveCitas = existingCitas.filter(
      (c) =>
        c.dateKey === dateKey &&
        c.status !== 'CANCELADA' &&
        c.id !== editingCita?.id,
    )

    // 2. Regla: Un veterinario no puede estar a la misma hora en dos citas distintas
    const vetConflict = sameDayActiveCitas.find(
      (c) =>
        c.professionalId === professionalId &&
        checkIntervalOverlap(startTime, endTime, c.startTime, c.endTime),
    )
    if (vetConflict) {
      const vetName =
        profesionalesOpciones.find((p) => p.id === professionalId)?.name || 'El veterinario'
      return `${vetName} ya tiene una cita agendada en ese horario (${vetConflict.startTime} - ${vetConflict.endTime}) para ${vetConflict.petName || 'otra mascota'}.`
    }

    // 3. Regla: Un consultorio no puede tener más de una cita a la vez
    const consultorioConflict = sameDayActiveCitas.find(
      (c) =>
        (c.consultorio || 'Consultorio 1').toLowerCase() === consultorio.toLowerCase() &&
        checkIntervalOverlap(startTime, endTime, c.startTime, c.endTime),
    )
    if (consultorioConflict) {
      return `El ${consultorio} ya está ocupado en ese horario (${consultorioConflict.startTime} - ${consultorioConflict.endTime}). Por favor selecciona otro consultorio u horario.`
    }

    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const pet = selectedPet
      const serviceName = serviciosOpciones.find((s) => s.id === serviceId)?.name || 'Servicio'

      await onSave({
        clientPetId,
        petName: pet?.petName || 'Mascota',
        petBreed: pet?.breed || '',
        species: pet?.species || 'Canino',
        ownerName: pet?.ownerName || 'Dueño',
        dateKey,
        startTime,
        endTime,
        professionalId,
        serviceId,
        service: serviceName,
        consultorio,
        notes,
        status,
      })

      handleClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la cita'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex justify-end transition-opacity duration-300 animate-fadeIn"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full sm:w-[440px] lg:w-[480px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-soft text-brand flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-brand leading-tight">
                {editingCita ? 'Reprogramar Cita' : 'Nueva Cita'}
              </h3>
              <p className="text-[11px] text-sage font-medium">
                {editingCita
                  ? 'Modifica los datos y horarios de la cita'
                  : 'Registra una nueva atención veterinaria'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
            aria-label="Cerrar formulario"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20 animate-pop-in">
              {error}
            </div>
          )}

          {/* 1. Selección de Mascota (1 Mascota por cita) */}
          <div>
            <label className="block font-bold text-charcoal mb-1">
              Mascota y Dueño <span className="text-terracotta">*</span>
            </label>
            <ProfessionalCombobox
              value={clientPetId}
              onChange={(id) => {
                setClientPetId(id)
                setError(null)
              }}
              options={mascotasPetOwnerOpciones}
              hasAllOption={false}
              placeholder="Sin mascotas disponibles"
              searchPlaceholder="Buscar por mascota o dueño..."
              className="w-full"
            />
            {selectedPet && (
              <p className="text-[11px] text-sage font-semibold mt-1">
                Paciente: {selectedPet.petName} ({selectedPet.species} · {selectedPet.breed || 'Sin raza'})
              </p>
            )}
          </div>

          {/* 2. Fecha */}
          <div>
            <label className="block font-bold text-charcoal mb-1">
              Fecha de la Cita <span className="text-terracotta">*</span>
            </label>
            <input
              type="date"
              required
              min={todayIsoDateLocal()}
              value={dateKey}
              onChange={(e) => {
                setDateKey(e.target.value)
                setError(null)
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition font-medium"
            />
          </div>

          {/* 3. Horario (07:00 a 17:00) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-charcoal mb-1">
                Hora Inicio <span className="text-terracotta">*</span>
              </label>
              <input
                type="time"
                required
                min={HORARIO_APERTURA}
                max={HORARIO_CIERRE}
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value)
                  setError(null)
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-charcoal mb-1">
                Hora Fin <span className="text-terracotta">*</span>
              </label>
              <input
                type="time"
                required
                min={HORARIO_APERTURA}
                max={HORARIO_CIERRE}
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value)
                  setError(null)
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition font-medium"
              />
            </div>
          </div>
          <p className="text-[10px] text-sage -mt-2">
            Horario de atención: <strong>{HORARIO_APERTURA}</strong> a <strong>{HORARIO_CIERRE}</strong> (7:00 AM - 5:00 PM).
          </p>

          {/* 4. Médico Profesional */}
          <div className="relative z-20">
            <label className="block font-bold text-charcoal mb-1">
              Médico Veterinario <span className="text-terracotta">*</span>
            </label>
            <ProfessionalCombobox
              value={professionalId}
              onChange={(id) => {
                setProfessionalId(id)
                setError(null)
              }}
              options={profesionalesOpciones}
              hasAllOption={false}
              placeholder="Seleccionar médico veterinario..."
              searchPlaceholder="Buscar veterinario por nombre..."
              className="w-full bg-white"
            />
          </div>

          {/* 5. Servicio y Consultorio en Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            <div>
              <label className="block font-bold text-charcoal mb-1">
                Servicio <span className="text-terracotta">*</span>
              </label>
              <ProfessionalCombobox
                value={serviceId}
                onChange={(id) => {
                  setServiceId(id)
                  setError(null)
                }}
                options={serviciosOpciones}
                hasAllOption={false}
                placeholder="Seleccionar servicio..."
                searchPlaceholder="Buscar servicio por nombre..."
                className="w-full bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal mb-1">
                Consultorio <span className="text-terracotta">*</span>
              </label>
              <select
                value={consultorio}
                onChange={(e) => {
                  setConsultorio(e.target.value)
                  setError(null)
                }}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-border-tan bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer font-medium"
              >
                {CONSULTORIOS_DISPONIBLES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. Notas de la Cita */}
          <div>
            <label className="block font-bold text-charcoal mb-1">Notas / Motivo de Consulta</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Chequeo anual, traer cartilla de vacunación."
              className="w-full px-3.5 py-2 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none"
            />
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-border-tan/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border-tan text-sage font-bold hover:bg-bone hover:text-charcoal transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{editingCita ? 'Guardar cambios' : 'Crear cita'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
