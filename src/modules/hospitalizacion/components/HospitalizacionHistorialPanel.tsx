import { Fragment, useEffect, useState } from 'react'
import type { ApiHospitalizationStay } from '../types/hospitalizacion.types'
import { fetchStaysByPet } from '../services/hospitalizacionService'
import { HospitalizacionNotasPanel } from './HospitalizacionNotasPanel'
import { HospitalizacionOrdenesPanel } from './HospitalizacionOrdenesPanel'
import { HospitalizacionInsumosPanel } from './HospitalizacionInsumosPanel'

interface HospitalizacionHistorialPanelProps {
  clientPetId?: string
  currentStayId: string
  canView?: boolean
  canViewNotes?: boolean
  canViewOrders?: boolean
  canViewSupplies?: boolean
  onViewInvoice?: (stayId: string) => void
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-CO')
}

export function HospitalizacionHistorialPanel({
  clientPetId,
  currentStayId,
  canView = true,
  canViewNotes = false,
  canViewOrders = false,
  canViewSupplies = false,
  onViewInvoice,
}: HospitalizacionHistorialPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stays, setStays] = useState<ApiHospitalizationStay[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedStayId, setExpandedStayId] = useState<string | null>(null)

  const load = async () => {
    if (!clientPetId) return
    setIsLoading(true)
    setError(null)
    try {
      setStays(await fetchStaysByPet(clientPetId))
    } catch {
      setError('No se pudo cargar el historial de hospitalizaciones.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) void load()
  }, [isOpen, clientPetId])

  if (!canView || !clientPetId) return null

  return (
    <section className="bg-white rounded-2xl border border-border-tan shadow-xs overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 bg-bone/40">
        <div>
          <h2 className="text-base font-bold text-charcoal">Historial de hospitalizaciones</h2>
          <p className="text-xs text-sage mt-0.5">Consulta las estancias anteriores de esta mascota.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="px-3 py-2 rounded-xl border border-border-tan bg-white text-xs font-bold text-brand hover:bg-bone transition"
        >
          {isOpen ? 'Ocultar historial' : 'Ver historial'}
        </button>
      </div>

      {isOpen && (
        <div className="p-4">
          {isLoading ? (
            <p className="text-sm text-sage">Cargando historial…</p>
          ) : error ? (
            <p className="text-sm text-danger">{error}</p>
          ) : stays.length === 0 ? (
            <p className="text-sm text-sage">No hay hospitalizaciones registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-sage border-b border-border-tan">
                  <tr>
                    <th className="py-2 pr-3">Ingreso</th>
                    <th className="py-2 px-3">Alta</th>
                    <th className="py-2 px-3">Motivo</th>
                    <th className="py-2 px-3">Estado</th>
                    <th className="py-2 px-3">Pago</th>
                    <th className="py-2 pl-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tan/60">
                  {stays.map((stay) => {
                    const isExpanded = expandedStayId === stay.id
                    const isDischarged = stay.status === 'Dada de alta'

                    return (
                      <Fragment key={stay.id}>
                        <tr className={stay.id === currentStayId ? 'bg-brand/5' : ''}>
                          <td className="py-3 pr-3 whitespace-nowrap">{formatDate(stay.admittedAt)}</td>
                          <td className="py-3 px-3 whitespace-nowrap">{formatDate(stay.dischargedAt)}</td>
                          <td className="py-3 px-3 max-w-[220px]">{stay.motivo}</td>
                          <td className="py-3 px-3 whitespace-nowrap">{stay.status}</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {stay.isPaid ? 'Pagada' : isDischarged ? 'Pendiente de pago' : '—'}
                          </td>
                          <td className="py-3 pl-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setExpandedStayId(isExpanded ? null : stay.id)}
                                className="text-brand font-bold hover:underline"
                              >
                                {isExpanded ? 'Ocultar detalle' : 'Ver detalle clínico'}
                              </button>
                              {isDischarged && onViewInvoice && (
                                <button type="button" onClick={() => onViewInvoice(stay.id)} className="text-brand font-bold hover:underline">
                                  Ver liquidación
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="p-0 bg-bone/20">
                              <div className="p-4 sm:p-5 space-y-4 border-y border-border-tan">
                                <HospitalizacionNotasPanel
                                  stayId={stay.id}
                                  isDischarged={isDischarged}
                                  isStayLoading={false}
                                  canViewNotes={canViewNotes}
                                  canCreateNotes={false}
                                />
                                <HospitalizacionOrdenesPanel
                                  stayId={stay.id}
                                  clientPetId={stay.clientPetId}
                                  petName={stay.petName || undefined}
                                  ownerName={stay.ownerName || undefined}
                                  veterinarianName={stay.admittedByName || undefined}
                                  isDischarged={isDischarged}
                                  isStayLoading={false}
                                  canViewOrders={canViewOrders}
                                  canCreateOrders={false}
                                  canEditOrders={false}
                                />
                                <HospitalizacionInsumosPanel
                                  stayId={stay.id}
                                  isDischarged={isDischarged}
                                  isStayLoading={false}
                                  canViewSupplies={canViewSupplies}
                                  canCreateSupplies={false}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
