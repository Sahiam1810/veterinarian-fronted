import { useState, useEffect } from 'react'
import type { ApiHospitalizationStay } from '../types/hospitalizacion.types'
import { fetchStayById } from '../services/hospitalizacionService'
import { isStayActive } from '../utils/hospitalizacionView'
import { HospitalizacionInsumosPanel } from './HospitalizacionInsumosPanel'

export interface HospitalizacionDetalleViewProps {
  stayId: string
  stay?: ApiHospitalizationStay | null
  canEdit?: boolean
  canViewSupplies?: boolean
  canCreateSupplies?: boolean
  onBack?: () => void
}

export function HospitalizacionDetalleView({
  stayId,
  stay: initialStay = null,
  canEdit: _canEdit = false,
  canViewSupplies = false,
  canCreateSupplies = false,
  onBack,
}: HospitalizacionDetalleViewProps) {
  const [stay, setStay] = useState<ApiHospitalizationStay | null>(initialStay)
  const [isLoadingStay, setIsLoadingStay] = useState(!initialStay)
  const [stayError, setStayError] = useState<string | null>(null)

  useEffect(() => {
    if (initialStay) {
      setStay(initialStay)
      setIsLoadingStay(false)
      return
    }

    let isMounted = true
    setIsLoadingStay(true)
    setStayError(null)

    fetchStayById(stayId)
      .then((data) => {
        if (isMounted) {
          setStay(data)
          setIsLoadingStay(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const apiErr = err as { response?: { data?: { message?: string } }; message?: string }
          setStayError(
            apiErr.response?.data?.message ||
              apiErr.message ||
              'No se pudo cargar la información de la estancia hospitalaria.',
          )
          setIsLoadingStay(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [stayId, initialStay])

  const isDischarged = stay ? !isStayActive(stay) : false

  return (
    <div className="flex flex-col gap-6 w-full animate-view-popup">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            Detalle de Hospitalización
          </h1>
          <p className="text-sm text-sage mt-1">
            Seguimiento de evolución, notas médicas, insumos consumidos y alta del paciente.
          </p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="self-start sm:self-auto px-4 py-2 text-sm font-medium rounded-xl border border-warm-grey text-charcoal hover:bg-bone transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver a la lista</span>
          </button>
        )}
      </div>

      {/* Stay Info Card */}
      {isLoadingStay ? (
        <div className="p-6 bg-white rounded-2xl border border-warm-grey/40 shadow-xs flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" />
        </div>
      ) : stayError ? (
        <div className="p-4 bg-terracotta-soft/30 border border-terracotta/30 text-terracotta text-xs rounded-xl">
          {stayError}
        </div>
      ) : stay ? (
        <div className="p-6 bg-white rounded-2xl border border-warm-grey/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-charcoal">
                {stay.petName || 'Paciente sin nombre'}
              </h2>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  stay.status === 'Activa'
                    ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/30'
                    : 'bg-bone text-sage border-warm-grey/50'
                }`}
              >
                {stay.status}
              </span>
            </div>
            <p className="text-xs text-slate">
              <span className="font-semibold text-charcoal">Propietario:</span>{' '}
              {stay.ownerName || 'Sin propietario registrado'}
            </p>
            <p className="text-xs text-slate">
              <span className="font-semibold text-charcoal">Motivo de ingreso:</span> {stay.motivo}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-xs text-slate border-t md:border-t-0 md:border-l border-warm-grey/30 pt-3 md:pt-0 md:pl-6">
            <div>
              <span className="text-sage block">Fecha de ingreso</span>
              <span className="font-semibold text-charcoal">
                {new Date(stay.admittedAt).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {stay.dischargedAt && (
              <div>
                <span className="text-sage block">Fecha de alta</span>
                <span className="font-semibold text-charcoal">
                  {new Date(stay.dischargedAt).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            <div>
              <span className="text-sage block">Admitido por</span>
              <span className="font-semibold text-charcoal">
                {stay.admittedByName || 'Personal médico'}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Panel de Insumos Consumidos */}
      <HospitalizacionInsumosPanel
        stayId={stayId}
        isDischarged={isDischarged}
        isStayLoading={isLoadingStay || !!stayError || !stay}
        canViewSupplies={canViewSupplies}
        canCreateSupplies={canCreateSupplies}
      />
    </div>
  )
}
