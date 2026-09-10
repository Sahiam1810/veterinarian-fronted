import { useState, useEffect, useMemo } from 'react'
import { PawIcon } from '@/global/components'
import {
  fetchDiagnostics,
  createMedicalRecord,
  fetchStatusAppointments,
  updateAppointmentStatus,
  findStatusId,
} from '../services'
import type { ApiDiagnostic } from '../services'
import { CloseIcon, MedicalFolderIcon } from './MascotasIcons'
import { ViewPopup } from './ViewPopup'
import {
  pickDefaultDiagnosticId,
  getMissingDiagnosticError,
} from '../utils/registrarAtencionDiagnostics'

export interface AvailableAppointmentOption {
  id: string
  serviceName?: string | null
  scheduledStart: string
  statusName?: string | null
}

interface RegistrarAtencionModalProps {
  isOpen: boolean
  petId: string
  petName: string
  speciesBreed?: string
  clientPetId: string
  appointmentId: string
  serviceName?: string
  scheduledStart?: string
  availableAppointments?: AvailableAppointmentOption[]
  onClose: () => void
  onSuccess: (result: { recordId: string; petId: string; appointmentId: string }) => void
}

export function RegistrarAtencionModal({
  isOpen,
  petId,
  petName,
  speciesBreed,
  clientPetId,
  appointmentId: initialAppointmentId,
  serviceName,
  scheduledStart,
  availableAppointments = [],
  onClose,
  onSuccess,
}: RegistrarAtencionModalProps) {
  const [diagnostics, setDiagnostics] = useState<ApiDiagnostic[]>([])
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(initialAppointmentId)
  const [selectedDiagnosticId, setSelectedDiagnosticId] = useState('')
  const [diagnosticSearch, setDiagnosticSearch] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [treatment, setTreatment] = useState('')
  const [weight, setWeight] = useState('')
  const [temperature, setTemperature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedAppointmentId(initialAppointmentId)
  }, [initialAppointmentId])

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    async function loadDiagnosticsList() {
      setIsLoadingDiagnostics(true)
      try {
        const list = await fetchDiagnostics(false)
        if (!cancelled) {
          setDiagnostics(list)
          setSelectedDiagnosticId((current) => pickDefaultDiagnosticId(list, current))
        }
      } catch {
        // Silently handle error or fallback
      } finally {
        if (!cancelled) setIsLoadingDiagnostics(false)
      }
    }

    void loadDiagnosticsList()
    return () => {
      cancelled = true
    }
  }, [isOpen])

  const filteredDiagnostics = useMemo(() => {
    if (!diagnosticSearch.trim()) return diagnostics
    const query = diagnosticSearch.toLowerCase().trim()
    return diagnostics.filter(
      (d) =>
        d.name?.toLowerCase().includes(query) ||
        d.code?.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query),
    )
  }, [diagnostics, diagnosticSearch])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedAppointmentId) {
      setFormError('Se requiere una cita asociada para registrar la atención médica.')
      return
    }

    if (!clientPetId) {
      setFormError('No se encontró el vínculo de la mascota con el cliente.')
      return
    }

    const diagnosticError = getMissingDiagnosticError(selectedDiagnosticId)
    if (diagnosticError) {
      setFormError(diagnosticError)
      return
    }

    const weightNum = weight.trim() ? parseFloat(weight.replace(',', '.')) : null
    if (weightNum !== null && (Number.isNaN(weightNum) || weightNum <= 0 || weightNum > 300)) {
      setFormError('Por favor ingresa un peso válido en kg (ej. 12.5).')
      return
    }

    const tempNum = temperature.trim() ? parseFloat(temperature.replace(',', '.')) : null
    if (tempNum !== null && (Number.isNaN(tempNum) || tempNum < 25 || tempNum > 45)) {
      setFormError('Por favor ingresa una temperatura válida en °C (ej. 38.5).')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Crear el registro médico en el backend
      const result = await createMedicalRecord({
        clientPetId,
        appointmentId: selectedAppointmentId,
        diagnosticId: selectedDiagnosticId,
        symptoms: symptoms.trim() || null,
        treatment: treatment.trim() || null,
        weightAtVisit: weightNum,
        temperature: tempNum,
      })

      // 2. Transición canónica de la cita a ATENDIDA si no lo estaba
      try {
        const statuses = await fetchStatusAppointments()
        const atendidaId = findStatusId(statuses, 'atendida')
        if (atendidaId) {
          await updateAppointmentStatus(selectedAppointmentId, {
            statusId: atendidaId,
            comment: null,
          })
        }
      } catch {
        // La consulta médica ya se guardó con éxito; no bloquear si la cita ya estaba en estado final
      }

      onSuccess({
        recordId: result?.id || '',
        petId,
        appointmentId: selectedAppointmentId,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar la consulta médica.'
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-registrar-atencion-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/45 backdrop-blur-xs cursor-pointer border-0"
        aria-label="Cerrar modal"
        onClick={onClose}
      />

      <ViewPopup
        animationKey="registrar-atencion-modal"
        className="relative z-10 w-full max-w-2xl max-h-[min(94dvh,840px)] min-h-0 flex flex-col"
      >
        <div className="bg-bone border border-border-tan rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[min(94dvh,840px)]">
          {/* Header */}
          <header className="shrink-0 flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-border-tan bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-sage-soft text-brand flex items-center justify-center shrink-0">
                <MedicalFolderIcon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h2
                  id="modal-registrar-atencion-title"
                  className="text-base sm:text-lg font-extrabold text-brand tracking-tight truncate"
                >
                  Registrar Atención Médica
                </h2>
                <p className="text-xs text-sage font-medium truncate">
                  Paciente: <span className="font-bold text-charcoal">{petName}</span>
                  {speciesBreed ? ` · ${speciesBreed}` : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center bg-white shrink-0"
              aria-label="Cerrar"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </header>

          {/* Form body */}
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs sm:text-sm font-medium leading-snug"
                >
                  {formError}
                </div>
              )}

              {/* Selector de cita si hay múltiples disponibles */}
              {availableAppointments.length > 1 ? (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-sage mb-1">
                    Cita Asociada *
                  </label>
                  <select
                    value={selectedAppointmentId}
                    onChange={(e) => setSelectedAppointmentId(e.target.value)}
                    className="w-full rounded-xl border border-border-tan bg-white px-3 py-2.5 text-xs sm:text-sm font-semibold text-charcoal focus:outline-none focus:border-brand transition"
                  >
                    {availableAppointments.map((apt) => (
                      <option key={apt.id} value={apt.id}>
                        {new Date(apt.scheduledStart).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        - {apt.serviceName || 'Consulta'} ({apt.statusName || 'Agendada'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : serviceName || scheduledStart ? (
                <div className="rounded-xl bg-white border border-border-tan p-3 flex items-center justify-between text-xs text-charcoal">
                  <span className="font-semibold text-sage uppercase tracking-wide text-[10px]">
                    Cita en curso:
                  </span>
                  <span className="font-bold text-brand">
                    {serviceName || 'Consulta'}
                    {scheduledStart ? ` · ${new Date(scheduledStart).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </span>
                </div>
              ) : null}

              {/* Diagnóstico */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-sage mb-1">
                  Diagnóstico Clínico *
                </label>
                {diagnostics.length > 5 && (
                  <input
                    type="text"
                    placeholder="Filtrar catálogo de diagnósticos…"
                    value={diagnosticSearch}
                    onChange={(e) => setDiagnosticSearch(e.target.value)}
                    className="w-full mb-1.5 rounded-lg border border-border-tan bg-white px-3 py-1.5 text-xs text-charcoal placeholder:text-text-placeholder focus:outline-none focus:border-brand"
                  />
                )}
                <select
                  value={selectedDiagnosticId}
                  onChange={(e) => setSelectedDiagnosticId(e.target.value)}
                  disabled={isLoadingDiagnostics}
                  className="w-full rounded-xl border border-border-tan bg-white px-3 py-2.5 text-xs sm:text-sm font-semibold text-charcoal focus:outline-none focus:border-brand transition disabled:opacity-60"
                  required
                >
                  <option value="" disabled>
                    {isLoadingDiagnostics ? 'Cargando diagnósticos…' : 'Selecciona un diagnóstico…'}
                  </option>
                  {filteredDiagnostics.map((diag) => (
                    <option key={diag.id} value={diag.id}>
                      {diag.code ? `[${diag.code}] ` : ''}
                      {diag.name || diag.description || diag.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Signos Vitales y Medidas (Peso + Temperatura) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-sage mb-1">
                    Peso en la visita (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    max="250"
                    placeholder="Ej. 14.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-xl border border-border-tan bg-white px-3 py-2.5 text-xs sm:text-sm font-semibold text-charcoal placeholder:text-text-placeholder focus:outline-none focus:border-brand transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-sage mb-1">
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="44"
                    placeholder="Ej. 38.5"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full rounded-xl border border-border-tan bg-white px-3 py-2.5 text-xs sm:text-sm font-semibold text-charcoal placeholder:text-text-placeholder focus:outline-none focus:border-brand transition"
                  />
                </div>
              </div>

              {/* Síntomas / Motivo de consulta */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-sage mb-1">
                  Síntomas / Motivo de Consulta
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe los síntomas observados, tiempo de evolución y hallazgos en la anamnesis…"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full rounded-xl border border-border-tan bg-white p-3 text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:border-brand transition resize-none leading-relaxed"
                />
              </div>

              {/* Tratamiento / Indicaciones */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-sage mb-1">
                  Tratamiento / Indicaciones
                </label>
                <textarea
                  rows={3}
                  placeholder="Medicamentos formulados, dosis, posología, recomendaciones de cuidado y dieta…"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="w-full rounded-xl border border-border-tan bg-white p-3 text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:border-brand transition resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <footer className="shrink-0 flex items-center justify-end gap-2.5 p-3 sm:p-4 border-t border-border-tan bg-white">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal text-xs sm:text-sm font-bold hover:bg-bone transition cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !selectedDiagnosticId || !selectedAppointmentId}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Guardando registro…</span>
                ) : (
                  <>
                    <PawIcon className="w-4 h-4" />
                    <span>Guardar Registro Médico</span>
                  </>
                )}
              </button>
            </footer>
          </form>
        </div>
      </ViewPopup>
    </div>
  )
}
