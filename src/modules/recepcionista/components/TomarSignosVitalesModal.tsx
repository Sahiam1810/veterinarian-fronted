import { useState, useEffect } from 'react'
import { StethoscopeIcon } from '@/global/components'
import { CloseIcon } from './RecepMascotasIcons'
import { ViewPopup } from './ViewPopup'
import { updateAppointmentVitals, type ApiAppointmentVitalsRequest } from '../services/recepAgendaService'

export interface TomarSignosVitalesModalProps {
  isOpen: boolean
  appointmentId: string
  petName?: string
  initialVitals?: {
    weightKg?: number | null
    temperature?: number | null
    heartRate?: number | null
    respiratoryRate?: number | null
  }
  onClose: () => void
  onSuccess: (updatedVitals: {
    weightKg: number | null
    temperature: number | null
    heartRate: number | null
    respiratoryRate: number | null
  }) => void
}

export function TomarSignosVitalesModal({
  isOpen,
  appointmentId,
  petName,
  initialVitals,
  onClose,
  onSuccess,
}: TomarSignosVitalesModalProps) {
  const [weight, setWeight] = useState('')
  const [temperature, setTemperature] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [respiratoryRate, setRespiratoryRate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setWeight(initialVitals?.weightKg != null ? String(initialVitals.weightKg) : '')
      setTemperature(initialVitals?.temperature != null ? String(initialVitals.temperature) : '')
      setHeartRate(initialVitals?.heartRate != null ? String(initialVitals.heartRate) : '')
      setRespiratoryRate(initialVitals?.respiratoryRate != null ? String(initialVitals.respiratoryRate) : '')
      setFormError(null)
    }
  }, [isOpen, initialVitals])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!appointmentId) {
      setFormError('No se encontró el identificador de la cita.')
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

    const hrNum = heartRate.trim() ? parseInt(heartRate.trim(), 10) : null
    if (hrNum !== null && (Number.isNaN(hrNum) || hrNum <= 0 || hrNum > 400)) {
      setFormError('Por favor ingresa una frecuencia cardíaca válida en lpm (ej. 110).')
      return
    }

    const rrNum = respiratoryRate.trim() ? parseInt(respiratoryRate.trim(), 10) : null
    if (rrNum !== null && (Number.isNaN(rrNum) || rrNum <= 0 || rrNum > 200)) {
      setFormError('Por favor ingresa una frecuencia respiratoria válida en rpm (ej. 24).')
      return
    }

    const payload: ApiAppointmentVitalsRequest = {
      weight: weightNum,
      temperature: tempNum,
      heartRate: hrNum,
      respiratoryRate: rrNum,
    }

    setIsSubmitting(true)
    try {
      await updateAppointmentVitals(appointmentId, payload)
      onSuccess({
        weightKg: weightNum,
        temperature: tempNum,
        heartRate: hrNum,
        respiratoryRate: rrNum,
      })
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudieron guardar los signos vitales.'
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden modal-backdrop-animate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-signos-vitales-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/45 backdrop-blur-xs cursor-pointer border-0"
        aria-label="Cerrar modal"
        onClick={onClose}
      />

      <ViewPopup
        animationKey={`signos-vitales-${appointmentId}`}
        className="relative z-10 w-full max-w-lg max-h-[min(94dvh,720px)] min-h-0 flex flex-col"
      >
        <div className="bg-bone border border-border-tan rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[min(94dvh,720px)]">
          {/* Header */}
          <header className="shrink-0 flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-border-tan bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-mint-soft text-brand border border-brand/20 flex items-center justify-center shrink-0">
                <StethoscopeIcon className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h2
                  id="modal-signos-vitales-title"
                  className="text-base sm:text-lg font-extrabold text-brand tracking-tight truncate"
                >
                  Tomar Signos Vitales
                </h2>
                <p className="text-xs text-sage font-medium truncate">
                  Paciente: <span className="font-bold text-charcoal">{petName || 'Mascota'}</span>
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

          {/* Form */}
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

              {/* Banner informativo */}
              <div className="rounded-xl border border-brand/20 bg-mint-soft/60 p-3 flex items-start gap-2.5 text-xs text-brand">
                <span className="text-base leading-none shrink-0">ℹ️</span>
                <p className="leading-snug">
                  Todos los campos son <strong>opcionales</strong>. Puedes registrar los datos que tengas disponibles al recibir al paciente en recepción.
                </p>
              </div>

              {/* Grilla de los 4 campos de signos vitales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Peso */}
                <div className="bg-white p-3.5 rounded-xl border border-border-tan space-y-1">
                  <label htmlFor="vital-weight" className="block text-[11px] font-bold uppercase tracking-wide text-sage">
                    Peso en recepción (kg)
                  </label>
                  <div className="relative">
                    <input
                      id="vital-weight"
                      type="number"
                      step="0.01"
                      min="0.05"
                      max="250"
                      placeholder="Ej. 12.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full rounded-lg border border-border-tan/80 bg-bone/30 px-3 py-2 text-sm font-bold text-charcoal placeholder:text-text-placeholder focus:bg-white focus:outline-none focus:border-brand transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sage pointer-events-none">
                      kg
                    </span>
                  </div>
                  <p className="text-[10px] text-sage font-medium">Báscula de recepción</p>
                </div>

                {/* Temperatura */}
                <div className="bg-white p-3.5 rounded-xl border border-border-tan space-y-1">
                  <label htmlFor="vital-temp" className="block text-[11px] font-bold uppercase tracking-wide text-sage">
                    Temperatura (°C)
                  </label>
                  <div className="relative">
                    <input
                      id="vital-temp"
                      type="number"
                      step="0.1"
                      min="30"
                      max="45"
                      placeholder="Ej. 38.5"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full rounded-lg border border-border-tan/80 bg-bone/30 px-3 py-2 text-sm font-bold text-charcoal placeholder:text-text-placeholder focus:bg-white focus:outline-none focus:border-brand transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sage pointer-events-none">
                      °C
                    </span>
                  </div>
                  <p className="text-[10px] text-sage font-medium">Termómetro digital / rectal</p>
                </div>

                {/* Frecuencia Cardíaca */}
                <div className="bg-white p-3.5 rounded-xl border border-border-tan space-y-1">
                  <label htmlFor="vital-hr" className="block text-[11px] font-bold uppercase tracking-wide text-sage">
                    Frecuencia Cardíaca (FC)
                  </label>
                  <div className="relative">
                    <input
                      id="vital-hr"
                      type="number"
                      step="1"
                      min="20"
                      max="350"
                      placeholder="Ej. 110"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="w-full rounded-lg border border-border-tan/80 bg-bone/30 px-3 py-2 text-sm font-bold text-charcoal placeholder:text-text-placeholder focus:bg-white focus:outline-none focus:border-brand transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sage pointer-events-none">
                      lpm
                    </span>
                  </div>
                  <p className="text-[10px] text-sage font-medium">Latidos por minuto</p>
                </div>

                {/* Frecuencia Respiratoria */}
                <div className="bg-white p-3.5 rounded-xl border border-border-tan space-y-1">
                  <label htmlFor="vital-rr" className="block text-[11px] font-bold uppercase tracking-wide text-sage">
                    Frecuencia Respiratoria (FR)
                  </label>
                  <div className="relative">
                    <input
                      id="vital-rr"
                      type="number"
                      step="1"
                      min="5"
                      max="180"
                      placeholder="Ej. 24"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(e.target.value)}
                      className="w-full rounded-lg border border-border-tan/80 bg-bone/30 px-3 py-2 text-sm font-bold text-charcoal placeholder:text-text-placeholder focus:bg-white focus:outline-none focus:border-brand transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sage pointer-events-none">
                      rpm
                    </span>
                  </div>
                  <p className="text-[10px] text-sage font-medium">Respiraciones por minuto</p>
                </div>
              </div>
            </div>

            {/* Footer */}
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
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Guardando signos…</span>
                ) : (
                  <>
                    <StethoscopeIcon className="w-4 h-4" />
                    <span>Guardar Signos Vitales</span>
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
