import { useState, useEffect, useCallback } from 'react'
import type {
  ApiHospitalizationStay,
  HospitalizationInvoice,
} from '../types/hospitalizacion.types'
import {
  fetchStayById,
  fetchHospitalizationInvoice,
} from '../services/hospitalizacionService'
import { isStayActive } from '../utils/hospitalizacionView'
import { HospitalizationInvoiceModal } from './HospitalizationInvoiceModal'
import { HospitalizacionInsumosPanel } from './HospitalizacionInsumosPanel'

export interface HospitalizacionDetalleViewProps {
  stayId: string
  stay?: ApiHospitalizationStay | null
  canEdit?: boolean
  canView?: boolean
  canViewSupplies?: boolean
  canCreateSupplies?: boolean
  onBack?: () => void
}

export function HospitalizacionDetalleView({
  stayId,
  stay: initialStay = null,
  canEdit: _canEdit = false,
  canView = true,
  canViewSupplies = false,
  canCreateSupplies = false,
  onBack,
}: HospitalizacionDetalleViewProps) {
  const [stay, setStay] = useState<ApiHospitalizationStay | null>(initialStay)
  const [isLoadingStay, setIsLoadingStay] = useState(!initialStay)
  const [stayError, setStayError] = useState<string | null>(null)

  // Invoice modal state
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [invoice, setInvoice] = useState<HospitalizationInvoice | null>(null)
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)

  useEffect(() => {
    if (initialStay) {
      setStay(initialStay)
      setIsLoadingStay(false)
      return
    }

    if (!canView) {
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
  }, [stayId, initialStay, canView])

  const handleOpenInvoice = useCallback(async () => {
    if (!canView || !stayId) return

    setIsInvoiceOpen(true)
    setIsLoadingInvoice(true)
    setInvoiceError(null)

    try {
      const data = await fetchHospitalizationInvoice(stayId)
      setInvoice(data)
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string }
      setInvoiceError(
        apiErr.response?.data?.message ||
          apiErr.message ||
          'Error al consultar la liquidación de la estancia.',
      )
    } finally {
      setIsLoadingInvoice(false)
    }
  }, [canView, stayId])

  const isDischarged = stay ? !isStayActive(stay) : false

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-warm-grey/40 text-center gap-3">
        <p className="text-base font-bold text-charcoal">Acceso Restringido</p>
        <p className="text-sm text-sage">
          No tienes permisos para visualizar el detalle ni la liquidación de esta estancia hospitalaria.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-warm-grey text-charcoal hover:bg-bone transition"
          >
            Volver a la lista
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-view-popup">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            Detalle de Hospitalización
          </h1>
          <p className="text-sm text-sage mt-1">
            Seguimiento de evolución, notas médicas, insumos consumidos y liquidación del paciente.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Botón Ver Liquidación */}
          <button
            type="button"
            onClick={() => void handleOpenInvoice()}
            disabled={isLoadingInvoice}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-brand text-white hover:bg-brand-hover transition shadow-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isLoadingInvoice ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Consultando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Ver liquidación</span>
              </>
            )}
          </button>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-warm-grey text-charcoal hover:bg-bone transition flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver a la lista</span>
            </button>
          )}
        </div>
      </div>

      {/* Stay Info Card */}
      {isLoadingStay ? (
        <div className="p-8 bg-white rounded-2xl border border-warm-grey/40 shadow-xs flex flex-col items-center justify-center gap-2.5">
          <div className="w-8 h-8 border-3 border-brand/30 border-t-brand rounded-full animate-spin" />
          <p className="text-xs text-sage font-medium">Cargando detalles de la estancia hospitalaria…</p>
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
                  isStayActive(stay)
                    ? 'bg-brand/10 text-brand border-brand/30'
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
      ) : (
        <div className="p-8 sm:p-12 bg-white rounded-2xl border border-warm-grey/40 shadow-xs flex flex-col items-center justify-center text-center">
          <p className="text-base font-semibold text-charcoal">
            Estadía #{stayId.slice(0, 8)}
          </p>
          <p className="text-sm text-sage mt-1">
            Consulta la liquidación y evolución de la estancia.
          </p>
        </div>
      )}

      {/* Modal de Liquidación / Factura */}
      <HospitalizationInvoiceModal
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
        invoice={invoice}
        isLoading={isLoadingInvoice}
        error={invoiceError}
        onRetry={handleOpenInvoice}
      />

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
