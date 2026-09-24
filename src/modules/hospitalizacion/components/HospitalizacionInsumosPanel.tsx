import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  ApiSupplyConsumption,
  ApiSupplyConsumptionTotal,
  ApiSupply,
} from '../types/hospitalizacion.types'
import {
  fetchStaySupplyConsumptions,
  fetchStaySupplyTotal,
  fetchActiveSupplies,
} from '../services/hospitalizacionService'
import {
  mapSupplyConsumptions,
  formatSupplyCurrency,
  formatSupplyDate,
} from '../utils/hospitalizacionSupplyMapping'
import { RegistrarInsumoModal } from './RegistrarInsumoModal'
import { PageToast, PackageIcon, PlusIcon } from '@/global/components'

export interface HospitalizacionInsumosPanelProps {
  stayId: string
  isDischarged?: boolean
  canViewSupplies?: boolean
  canCreateSupplies?: boolean
}

export function HospitalizacionInsumosPanel({
  stayId,
  isDischarged = false,
  canViewSupplies = true,
  canCreateSupplies = true,
}: HospitalizacionInsumosPanelProps) {
  const [consumptions, setConsumptions] = useState<ApiSupplyConsumption[]>([])
  const [supplyTotal, setSupplyTotal] = useState<ApiSupplyConsumptionTotal | null>(null)
  const [supplies, setSupplies] = useState<ApiSupply[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadData = useCallback(async () => {
    if (!canViewSupplies || !stayId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [consumptionsRes, totalRes, suppliesRes] = await Promise.all([
        fetchStaySupplyConsumptions(stayId),
        fetchStaySupplyTotal(stayId).catch(() => null),
        fetchActiveSupplies().catch(() => [] as ApiSupply[]),
      ])

      setConsumptions(consumptionsRes || [])
      setSupplyTotal(totalRes)
      setSupplies(suppliesRes || [])
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string }
      setError(
        apiErr.response?.data?.message ||
          apiErr.message ||
          'Error al cargar los consumos de insumos.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [canViewSupplies, stayId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const mappedConsumptions = useMemo(() => {
    return mapSupplyConsumptions(consumptions, supplies)
  }, [consumptions, supplies])

  const displayTotal = useMemo(() => {
    if (supplyTotal && typeof supplyTotal.total === 'number') {
      return supplyTotal.total
    }
    return consumptions.reduce((sum, c) => sum + (c.total || 0), 0)
  }, [supplyTotal, consumptions])

  // Si no tiene permiso de visualización de insumos, no mostramos el panel de consumos
  if (!canViewSupplies) {
    return (
      <div className="bg-white rounded-2xl border border-warm-grey/40 p-6 shadow-xs flex flex-col items-center justify-center text-center gap-2">
        <div className="w-10 h-10 rounded-full bg-bone flex items-center justify-center text-sage">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3.5a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-charcoal">Insumos consumidos</h3>
        <p className="text-xs text-sage max-w-sm">
          No tienes permisos suficientes (Insumos:View) para consultar los insumos consumidos de esta estancia.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-grey/40 shadow-xs overflow-hidden flex flex-col">
      {/* Panel Header */}
      <div className="px-6 py-4.5 border-b border-warm-grey/30 bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center shrink-0">
            <PackageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-charcoal tracking-tight">
                Insumos consumidos
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-bone text-sage rounded-full border border-warm-grey/40">
                {mappedConsumptions.length} {mappedConsumptions.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
            <p className="text-xs text-sage mt-0.5">
              Control y registro de medicamentos e insumos utilizados durante la estancia.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Total Acumulado Badge */}
          <div className="px-3.5 py-1.5 bg-brand-teal/5 border border-brand-teal/20 rounded-xl flex items-center gap-2">
            <span className="text-xs text-sage font-medium">Total insumos:</span>
            <span className="text-sm font-bold text-brand-dark">
              {formatSupplyCurrency(displayTotal)}
            </span>
          </div>

          {/* Botón Registrar Consumo */}
          {canCreateSupplies && !isDischarged && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-brand-teal text-white hover:bg-brand-dark transition shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Registrar consumo</span>
            </button>
          )}

          {isDischarged && (
            <span className="px-3 py-1.5 text-xs font-medium bg-bone text-sage border border-warm-grey/40 rounded-xl">
              Estancia dada de alta
            </span>
          )}
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" />
            <p className="text-xs text-sage font-medium">Cargando consumos de insumos...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-4 bg-terracotta-soft/30 border border-terracotta/30 rounded-xl flex items-center justify-between gap-3 text-xs text-terracotta">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadData()}
              className="px-3 py-1 bg-white border border-terracotta/40 rounded-lg font-medium hover:bg-terracotta-soft transition shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && mappedConsumptions.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-bone border border-warm-grey/40 flex items-center justify-center text-sage">
              <PackageIcon className="w-6 h-6 opacity-60" />
            </div>
            <div>
              <p className="text-sm font-bold text-charcoal">
                No hay consumos de insumos registrados
              </p>
              <p className="text-xs text-sage mt-1 max-w-sm">
                Los insumos y medicamentos suministrados durante esta estancia aparecerán aquí con su valor acumulado.
              </p>
            </div>
            {canCreateSupplies && !isDischarged && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-2 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-teal text-white hover:bg-brand-dark transition shadow-xs flex items-center gap-1.5"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Registrar primer consumo</span>
              </button>
            )}
          </div>
        )}

        {/* Tabla de Consumos */}
        {!isLoading && !error && mappedConsumptions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal border-collapse">
              <thead>
                <tr className="border-b border-warm-grey/40 text-[11px] font-bold text-sage uppercase tracking-wider bg-bone/30">
                  <th className="py-3 px-3.5">Insumo</th>
                  <th className="py-3 px-3.5">Unidad</th>
                  <th className="py-3 px-3.5 text-center">Cantidad</th>
                  <th className="py-3 px-3.5 text-right">Precio Unitario</th>
                  <th className="py-3 px-3.5 text-right">Total</th>
                  <th className="py-3 px-3.5">Notas</th>
                  <th className="py-3 px-3.5 text-right">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-grey/20">
                {mappedConsumptions.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3 px-3.5 font-semibold text-charcoal">
                      {item.supplyName}
                    </td>
                    <td className="py-3 px-3.5 text-slate">{item.supplyUnit}</td>
                    <td className="py-3 px-3.5 text-center font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-bone text-charcoal font-semibold">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right text-slate font-mono">
                      {formatSupplyCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-brand-dark font-mono">
                      {formatSupplyCurrency(item.total)}
                    </td>
                    <td className="py-3 px-3.5 text-slate max-w-xs truncate" title={item.notes || ''}>
                      {item.notes ? (
                        <span className="italic text-charcoal">{item.notes}</span>
                      ) : (
                        <span className="text-sage">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right text-sage whitespace-nowrap">
                      {formatSupplyDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-warm-grey/50 bg-[#FAF8F5] font-bold">
                  <td colSpan={4} className="py-3 px-3.5 text-right text-charcoal">
                    Total Acumulado de Insumos:
                  </td>
                  <td className="py-3 px-3.5 text-right text-brand-dark text-sm font-mono">
                    {formatSupplyCurrency(displayTotal)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal Registrar Insumo */}
      <RegistrarInsumoModal
        isOpen={isModalOpen}
        stayId={stayId}
        activeSupplies={supplies}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(msg) => {
          showToast(msg)
          void loadData()
        }}
      />

      {/* Toast Notificación */}
      {toastMessage && <PageToast message={toastMessage} />}
    </div>
  )
}
