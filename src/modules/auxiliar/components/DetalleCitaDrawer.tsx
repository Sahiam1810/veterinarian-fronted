import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { AuxDayAppointment } from '../types'
import { TomarSignosVitalesModal } from '@/modules/recepcionista/components'

export interface DetalleCitaDrawerProps {
  isOpen: boolean
  appointment: AuxDayAppointment | null
  onClose: () => void
  onVitalsUpdated?: () => void
}

export function DetalleCitaDrawer({
  isOpen,
  appointment,
  onClose,
  onVitalsUpdated,
}: DetalleCitaDrawerProps) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false)

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

  const avatarBg =
    appointment.avatarColor === 'peach'
      ? 'bg-[#f09a82] text-white'
      : 'bg-brand text-white'

  let aptBadgeClass = 'bg-[#eef2f6] text-slate-700'
  if (appointment.status === 'Atendida') aptBadgeClass = 'bg-[#d1fae5] text-[#065f46]'
  if (appointment.status === 'Cancelada' || appointment.status === 'No asistió') aptBadgeClass = 'bg-[#fde8e8] text-[#c81e1e]'
  if (appointment.status === 'En espera') aptBadgeClass = 'bg-[#fef0e6] text-[#b45309]'

  const canTakeVitals = appointment.status === 'Agendada' || appointment.status === 'En espera'
  const hasVitals =
    appointment.weightKg != null ||
    appointment.temperature != null ||
    appointment.heartRate != null ||
    appointment.respiratoryRate != null

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
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${aptBadgeClass}`}>
                  {appointment.status}
                </span>
              </div>
              <p className="text-xs text-sage font-medium truncate mt-0.5">
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

          {/* Signos Vitales */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between border-b border-border-tan/50 pb-1">
              <h4 className="text-xs font-bold text-sage uppercase tracking-wider flex items-center gap-1.5">
                <span>🩺</span> Signos Vitales (Recepción)
              </h4>
              {hasVitals ? (
                <span className="text-[10px] bg-mint-soft text-brand font-bold px-2 py-0.5 rounded-full border border-brand/20">
                  Registrados
                </span>
              ) : (
                <span className="text-[10px] text-sage font-medium italic">
                  No registrados
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-bone/40 p-2.5 rounded-2xl border border-border-tan/60 text-center">
                <span className="text-[10px] font-bold text-sage block uppercase">Peso</span>
                <span className="font-bold text-charcoal text-xs sm:text-sm">
                  {appointment.weightKg != null ? `${appointment.weightKg} kg` : '—'}
                </span>
              </div>
              <div className="bg-bone/40 p-2.5 rounded-2xl border border-border-tan/60 text-center">
                <span className="text-[10px] font-bold text-sage block uppercase">Temp.</span>
                <span className="font-bold text-charcoal text-xs sm:text-sm">
                  {appointment.temperature != null ? `${appointment.temperature} °C` : '—'}
                </span>
              </div>
              <div className="bg-bone/40 p-2.5 rounded-2xl border border-border-tan/60 text-center">
                <span className="text-[10px] font-bold text-sage block uppercase">FC</span>
                <span className="font-bold text-charcoal text-xs sm:text-sm">
                  {appointment.heartRate != null ? `${appointment.heartRate} lpm` : '—'}
                </span>
              </div>
              <div className="bg-bone/40 p-2.5 rounded-2xl border border-border-tan/60 text-center">
                <span className="text-[10px] font-bold text-sage block uppercase">FR</span>
                <span className="font-bold text-charcoal text-xs sm:text-sm">
                  {appointment.respiratoryRate != null ? `${appointment.respiratoryRate} rpm` : '—'}
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
              Observaciones y Notas Clínicas
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
          {canTakeVitals && (
            <button
              type="button"
              onClick={() => setIsVitalsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-mint-soft text-brand border border-brand/30 hover:bg-brand hover:text-white transition cursor-pointer shadow-2xs inline-flex items-center gap-1.5 active:translate-y-0.5"
            >
              <span>🩺</span>
              <span>{hasVitals ? 'Actualizar Signos' : 'Tomar Signos'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>

      {isVitalsModalOpen && (
        <TomarSignosVitalesModal
          isOpen={isVitalsModalOpen}
          appointmentId={appointment.rawAppointmentId || appointment.id}
          petName={appointment.petName}
          initialVitals={{
            weightKg: appointment.weightKg,
            temperature: appointment.temperature,
            heartRate: appointment.heartRate,
            respiratoryRate: appointment.respiratoryRate,
          }}
          onClose={() => setIsVitalsModalOpen(false)}
          onSuccess={(_updated) => {
            onVitalsUpdated?.()
            setIsVitalsModalOpen(false)
          }}
        />
      )}
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body)
  }

  return drawerContent
}
