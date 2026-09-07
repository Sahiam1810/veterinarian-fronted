import { useState } from 'react'
import { PawIcon, UserAvatarIcon } from '@/global/components'
import type { AgendaEventStatus, VetAppointmentStatus } from '../types'
import { CloseIcon, MedicalFolderIcon, PhoneIcon } from './MascotasIcons'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'
import { ViewPopup } from './ViewPopup'

export interface CitaActionTarget {
  id: string
  dateKey?: string
  startTime: string
  endTime?: string
  status: AgendaEventStatus | VetAppointmentStatus
  petName?: string
  species?: string
  speciesBreed?: string
  service?: string
  clientPetId?: string
  petId?: string
  ownerName?: string
  ownerPhone?: string
  rawStatusName?: string
}

interface CitaAccionesModalProps {
  isOpen: boolean
  appointment: CitaActionTarget | null
  onClose: () => void
  onAttendAndRegister: (appointment: CitaActionTarget) => void
  onChangeStatus: (
    appointmentId: string,
    statusKeyword: 'atendida' | 'cancelada' | 'no_asistio',
    comment?: string | null,
  ) => Promise<void>
  onViewHistoriaClinica?: (petId: string) => void
  isUpdatingStatus?: boolean
}

export function CitaAccionesModal({
  isOpen,
  appointment,
  onClose,
  onAttendAndRegister,
  onChangeStatus,
  onViewHistoriaClinica,
  isUpdatingStatus = false,
}: CitaAccionesModalProps) {
  const [cancellationComment, setCancellationComment] = useState('')
  const [showCancelPrompt, setShowCancelPrompt] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (!isOpen || !appointment) return null

  const speciesText = appointment.speciesBreed || appointment.species || 'Mascota'
  const isAtendida =
    appointment.status === 'ATENDIDA' ||
    appointment.status === 'ATENDIDO' ||
    /atendid|complet/i.test(appointment.rawStatusName || '')
  const isCancelada =
    appointment.status === 'CANCELADA' ||
    appointment.status === 'CANCELADO' ||
    /cancel/i.test(appointment.rawStatusName || '')
  const isNoAsistio =
    appointment.status === 'NO_ASISTIO' ||
    appointment.status === 'NO ASISTIÓ' ||
    /no\s*asist/i.test(appointment.rawStatusName || '')

  const handleMarkAtendida = async () => {
    setActionError(null)
    try {
      await onChangeStatus(appointment.id, 'atendida', null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo actualizar el estado.')
    }
  }

  const handleMarkNoAsistio = async () => {
    setActionError(null)
    try {
      await onChangeStatus(appointment.id, 'no_asistio', 'Marcada como No asistió por el veterinario')
      onClose()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo actualizar el estado.')
    }
  }

  const handleConfirmCancel = async () => {
    setActionError(null)
    try {
      await onChangeStatus(
        appointment.id,
        'cancelada',
        cancellationComment.trim() || 'Cancelada por el veterinario',
      )
      setShowCancelPrompt(false)
      setCancellationComment('')
      onClose()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo cancelar la cita.')
    }
  }

  // Normalizar status para el badge
  const badgeStatus: VetAppointmentStatus = isAtendida
    ? 'ATENDIDO'
    : isCancelada
      ? 'CANCELADO'
      : isNoAsistio
        ? 'NO ASISTIÓ'
        : appointment.status === 'EN_ESPERA' || appointment.status === 'EN ESPERA'
          ? 'EN ESPERA'
          : 'AGENDADO'

  return (
    <div
      className="fixed inset-0 z-[85] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cita-acciones-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/45 backdrop-blur-xs cursor-pointer border-0"
        aria-label="Cerrar modal"
        onClick={onClose}
      />

      <ViewPopup
        animationKey={`cita-acciones-${appointment.id}`}
        className="relative z-10 w-full max-w-lg max-h-[min(94dvh,720px)] min-h-0 flex flex-col"
      >
        <div className="bg-bone border border-border-tan rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <header className="shrink-0 flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-border-tan bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-cream text-brand border border-border-tan flex items-center justify-center shrink-0">
                <PawIcon className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h2
                  id="modal-cita-acciones-title"
                  className="text-base sm:text-lg font-extrabold text-brand tracking-tight truncate"
                >
                  Gestión de Cita
                </h2>
                <p className="text-xs text-sage font-medium truncate">
                  {appointment.service || 'Consulta'} · {appointment.startTime}
                  {appointment.endTime ? ` - ${appointment.endTime}` : ''}
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

          {/* Body */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
            {actionError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs sm:text-sm font-medium leading-snug"
              >
                {actionError}
              </div>
            )}

            {/* Ficha Resumen Paciente / Cita */}
            <div className="rounded-xl border border-border-tan bg-white p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <p className="font-extrabold text-charcoal text-base truncate">
                    {appointment.petName || 'Mascota'}
                  </p>
                  <p className="text-xs text-sage font-medium truncate">{speciesText}</p>
                </div>
                <AppointmentStatusBadge status={badgeStatus} />
              </div>

              <div className="pt-2 border-t border-border-tan/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-sage block">
                    Horario
                  </span>
                  <span className="font-bold text-charcoal">
                    {appointment.startTime} {appointment.endTime ? `a ${appointment.endTime}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-sage block">
                    Servicio
                  </span>
                  <span className="font-bold text-charcoal truncate block">
                    {appointment.service || 'Consulta General'}
                  </span>
                </div>
              </div>

              {appointment.ownerName && (
                <div className="pt-2 border-t border-border-tan/60 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0 text-charcoal/90">
                    <UserAvatarIcon className="w-3.5 h-3.5 text-sage shrink-0" />
                    <span className="font-medium truncate">{appointment.ownerName}</span>
                  </div>
                  {appointment.ownerPhone && (
                    <div className="flex items-center gap-1 text-sage shrink-0">
                      <PhoneIcon className="w-3 h-3" />
                      <span>{appointment.ownerPhone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Acción principal: Atender y Registrar Consulta */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onAttendAndRegister(appointment)}
                disabled={isUpdatingStatus}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-sm disabled:opacity-60"
              >
                <PawIcon className="w-4 h-4" />
                <span>Atender y Registrar Consulta</span>
              </button>

              {appointment.petId && onViewHistoriaClinica && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onViewHistoriaClinica(appointment.petId!)
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal text-xs sm:text-sm font-bold hover:bg-bone hover:text-brand transition cursor-pointer"
                >
                  <MedicalFolderIcon className="w-4 h-4 text-sage" />
                  <span>Ver Historia Clínica de {appointment.petName || 'la mascota'}</span>
                </button>
              )}
            </div>

            {/* Sección de cambio de estado */}
            <div className="pt-3 border-t border-border-tan/70 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-sage">
                Cambiar Estado de la Cita:
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isUpdatingStatus || isAtendida}
                  onClick={handleMarkAtendida}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    isAtendida
                      ? 'bg-terracotta-soft text-terracotta border-terracotta/30 opacity-70 cursor-default'
                      : 'bg-white text-charcoal border-border-tan hover:border-terracotta/40 hover:text-terracotta'
                  } disabled:opacity-60`}
                >
                  {isAtendida ? '✓ Atendida' : 'Atendida'}
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus || isNoAsistio}
                  onClick={handleMarkNoAsistio}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    isNoAsistio
                      ? 'bg-bone text-sage border-sage/40 opacity-70 cursor-default'
                      : 'bg-white text-charcoal border-border-tan hover:border-sage/50 hover:text-sage'
                  } disabled:opacity-60`}
                >
                  {isNoAsistio ? '✓ No asistió' : 'No asistió'}
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus || isCancelada}
                  onClick={() => setShowCancelPrompt(true)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    isCancelada
                      ? 'bg-danger-soft text-danger border-danger/30 opacity-70 cursor-default'
                      : 'bg-white text-charcoal border-border-tan hover:border-danger/40 hover:text-danger'
                  } disabled:opacity-60`}
                >
                  {isCancelada ? '✓ Cancelada' : 'Cancelar'}
                </button>
              </div>

              {/* Prompt de cancelación con motivo opcional */}
              {showCancelPrompt && (
                <div className="p-3 rounded-xl bg-danger-soft/60 border border-danger/30 space-y-2 mt-2">
                  <p className="text-xs font-bold text-danger">
                    ¿Confirmas que deseas cancelar esta cita?
                  </p>
                  <input
                    type="text"
                    placeholder="Motivo de cancelación (opcional)…"
                    value={cancellationComment}
                    onChange={(e) => setCancellationComment(e.target.value)}
                    className="w-full rounded-lg border border-danger/30 bg-white px-2.5 py-1.5 text-xs text-charcoal placeholder:text-text-placeholder focus:outline-none focus:border-danger"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCancelPrompt(false)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-sage hover:text-charcoal bg-white border border-border-tan"
                    >
                      Volver
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={handleConfirmCancel}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-danger hover:bg-danger/90 cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      {isUpdatingStatus ? 'Cancelando…' : 'Confirmar Cancelación'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ViewPopup>
    </div>
  )
}
