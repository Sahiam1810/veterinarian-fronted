import { useState } from 'react'
import { CalendarIcon } from '@/global/components'
import type { CitaSuperAdmin } from '../types'
import { getCitaDetalleFooterActions } from '../utils/citaDetalleActions'
import { TomarSignosVitalesModal } from '@/modules/recepcionista/components'

export interface CitaDetalleModalProps {
  cita: CitaSuperAdmin | null
  isOpen: boolean
  isPaid?: boolean
  canEdit?: boolean
  canDelete?: boolean
  onClose: () => void
  onCancel: (citaId: string) => void
  onReprogramar: (cita: CitaSuperAdmin) => void
  onMarcarAtendida: (citaId: string) => void
  onMarcarNoAsistio: (citaId: string) => void
  onRegistrarPago?: (citaId: string) => void
  onVitalsSaved?: () => void
}

function statusBadgeLabel(status: CitaSuperAdmin['status']): string {
  if (status === 'AGENDADA') return 'Agendada'
  if (status === 'ATENDIDA') return 'Atendida'
  if (status === 'CANCELADA') return 'Cancelada'
  if (status === 'NO_ASISTIO') return 'No asistió'
  if (status === 'EN_ESPERA') return 'En Espera'
  return status
}

function statusBadgeClass(status: CitaSuperAdmin['status']): string {
  if (status === 'AGENDADA') return 'bg-[#FBF1E6] text-ochre border border-ochre/25'
  if (status === 'EN_ESPERA') return 'bg-[#E8F2EF] text-brand border border-brand/20'
  return 'bg-[#F1EFEA] text-sage border border-border-tan'
}

// Modal de detalle de cita (Agenda SuperAdmin); no se abre por auto-selección del hook.
export function CitaDetalleModal({
  cita,
  isOpen,
  isPaid = false,
  canEdit = true,
  canDelete = true,
  onClose,
  onCancel,
  onReprogramar,
  onMarcarAtendida,
  onMarcarNoAsistio,
  onRegistrarPago,
  onVitalsSaved,
}: CitaDetalleModalProps) {
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false)

  if (!isOpen || !cita) return null

  const actions = getCitaDetalleFooterActions(cita.status)
  const showCancelar = actions.showCancelar && canDelete
  const showReprogramar = actions.showReprogramar && canEdit
  const showMarcarNoAsistio = actions.showMarcarNoAsistio && canEdit
  const showMarcarAtendida = actions.showMarcarAtendida && canEdit
  const canTakeVitals = cita.status === 'AGENDADA' || cita.status === 'EN_ESPERA'
  const hasVitals =
    cita.weightKg != null ||
    cita.temperature != null ||
    cita.heartRate != null ||
    cita.respiratoryRate != null

  const showNoActionsMessage =
    !showCancelar &&
    !showReprogramar &&
    !showMarcarNoAsistio &&
    !showMarcarAtendida &&
    !canTakeVitals

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 overflow-hidden modal-backdrop-animate"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de cita de ${cita.petName || 'paciente'}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-xs cursor-pointer border-0"
        aria-label="Cerrar detalle de cita"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl max-h-[min(92vh,720px)] min-h-0 modal-content-animate">
        <div className="bg-bone border border-border-tan rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[min(92vh,720px)]">
          <header className="shrink-0 flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-border-tan bg-white">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-brand tracking-tight">
                Detalles de la Cita Seleccionada
              </h2>
              <p className="text-[11px] sm:text-xs text-sage font-medium mt-0.5 truncate">
                {cita.petName || 'Paciente'} · {cita.dateKey} · {cita.startTime}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${statusBadgeClass(cita.status)}`}
              >
                {statusBadgeLabel(cita.status)}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center bg-white"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div>
                <h4 className="text-sage font-bold uppercase tracking-wider text-[10px]">
                  Paciente & Dueño
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-9 h-9 rounded-full bg-mint-soft text-brand font-bold text-xs flex items-center justify-center border border-brand/20">
                    {cita.petName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-charcoal leading-tight">
                      {cita.petName} ({cita.petBreed})
                    </p>
                    <p className="text-[11px] text-sage leading-none mt-0.5">{cita.ownerName}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sage font-bold uppercase tracking-wider text-[10px]">
                  Fecha y Hora
                </h4>
                <div className="flex items-center gap-2 mt-1.5 text-charcoal font-medium">
                  <CalendarIcon className="w-4 h-4 text-sage" />
                  <div>
                    <p className="leading-tight">{cita.dateKey}</p>
                    <p className="text-[11px] text-sage leading-none mt-0.5">
                      {cita.startTime} - {cita.endTime}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sage font-bold uppercase tracking-wider text-[10px]">
                  Profesional y Servicio
                </h4>
                <div className="mt-1.5">
                  <p className="font-bold text-charcoal leading-tight">{cita.professionalName}</p>
                  <p className="text-[11px] text-sage mt-0.5">{cita.service}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sage font-bold uppercase tracking-wider text-[10px]">
                  Consultorio Asignado
                </h4>
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-mint-soft text-brand font-bold text-xs border border-brand/20">
                    {cita.consultorio || 'Consultorio 1'}
                  </span>
                </div>
              </div>

              {/* Signos Vitales */}
              <div className="sm:col-span-2 md:col-span-4 rounded-xl border border-border-tan/80 bg-bone/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sage font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-border-tan/70 text-center">
                    <span className="text-[10px] font-bold text-sage block uppercase">Peso</span>
                    <span className="text-xs sm:text-sm font-extrabold text-charcoal">
                      {cita.weightKg != null ? `${cita.weightKg} kg` : '—'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-border-tan/70 text-center">
                    <span className="text-[10px] font-bold text-sage block uppercase">Temperatura</span>
                    <span className="text-xs sm:text-sm font-extrabold text-charcoal">
                      {cita.temperature != null ? `${cita.temperature} °C` : '—'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-border-tan/70 text-center">
                    <span className="text-[10px] font-bold text-sage block uppercase">Frec. Cardíaca</span>
                    <span className="text-xs sm:text-sm font-extrabold text-charcoal">
                      {cita.heartRate != null ? `${cita.heartRate} lpm` : '—'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-border-tan/70 text-center">
                    <span className="text-[10px] font-bold text-sage block uppercase">Frec. Resp.</span>
                    <span className="text-xs sm:text-sm font-extrabold text-charcoal">
                      {cita.respiratoryRate != null ? `${cita.respiratoryRate} rpm` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 md:col-span-4">
                <h4 className="text-sage font-bold uppercase tracking-wider text-[10px]">Notas</h4>
                <p className="mt-1.5 text-charcoal/80 text-[11px] sm:text-xs leading-relaxed italic">
                  {cita.notes || 'Sin notas.'}
                </p>
              </div>
            </div>
          </div>

          <footer className="shrink-0 flex flex-wrap items-center justify-end gap-3 px-4 sm:px-5 py-3.5 border-t border-border-tan/60 bg-white">
            {canTakeVitals && (
              <button
                type="button"
                onClick={() => setIsVitalsModalOpen(true)}
                className="border border-brand/30 bg-mint-soft text-brand hover:bg-brand hover:text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-2xs inline-flex items-center gap-1.5 active:translate-y-0.5"
              >
                <span>🩺</span>
                <span>{hasVitals ? 'Actualizar Signos Vitales' : 'Tomar Signos Vitales'}</span>
              </button>
            )}

            {showCancelar && (
              <button
                type="button"
                onClick={() => onCancel(cita.id)}
                className="text-danger hover:text-red-700 text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                Cancelar Cita
              </button>
            )}

            {showReprogramar && (
              <button
                type="button"
                onClick={() => onReprogramar(cita)}
                className="border border-border-tan bg-white hover:bg-bone text-charcoal text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-2xs"
              >
                Reprogramar
              </button>
            )}

            {showMarcarNoAsistio && (
              <button
                type="button"
                onClick={() => onMarcarNoAsistio(cita.id)}
                className="border border-border-tan bg-white hover:bg-bone text-charcoal text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-2xs"
              >
                Marcar No Asistió
              </button>
            )}

            {showMarcarAtendida && (
              <>
                {!isPaid ? (
                  <button
                    type="button"
                    onClick={() => onRegistrarPago?.(cita.id)}
                    className="border border-ochre/40 bg-[#FBF1E6] hover:bg-ochre/15 text-ochre text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-2xs inline-flex items-center gap-1.5 active:translate-y-0.5"
                    title="Registrar el pago de la cita para habilitar la atención"
                  >
                    <span>Registrar Pago</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mint-soft text-brand text-xs font-bold border border-brand/20 shadow-2xs">
                    <span className="text-xs">✓</span> Pago Registrado
                  </span>
                )}

                <button
                  type="button"
                  disabled={!isPaid}
                  onClick={() => isPaid && onMarcarAtendida(cita.id)}
                  title={
                    !isPaid
                      ? 'Debes registrar el pago antes de marcar la cita como atendida'
                      : 'Marcar cita como atendida'
                  }
                  className={`${
                    isPaid
                      ? 'bg-brand hover:bg-brand-hover text-white cursor-pointer shadow-xs active:translate-y-0.5'
                      : 'bg-brand/35 text-white/70 cursor-not-allowed shadow-none'
                  } text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition`}
                >
                  Marcar Atendida
                </button>
              </>
            )}

            {showNoActionsMessage && (
              <p className="text-[11px] text-sage font-medium">
                Esta cita no tiene acciones disponibles con tus permisos actuales.
              </p>
            )}
          </footer>
        </div>
      </div>

      {isVitalsModalOpen && (
        <TomarSignosVitalesModal
          isOpen={isVitalsModalOpen}
          appointmentId={cita.id}
          petName={cita.petName}
          initialVitals={{
            weightKg: cita.weightKg,
            temperature: cita.temperature,
            heartRate: cita.heartRate,
            respiratoryRate: cita.respiratoryRate,
          }}
          onClose={() => setIsVitalsModalOpen(false)}
          onSuccess={(_updated) => {
            onVitalsSaved?.()
            setIsVitalsModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
