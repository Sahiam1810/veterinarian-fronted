import { useState, useEffect, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import type { AuxDayAppointment } from '../types'

export interface PrepararCitaDrawerProps {
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
