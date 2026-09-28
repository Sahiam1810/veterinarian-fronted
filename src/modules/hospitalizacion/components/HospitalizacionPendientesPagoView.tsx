import { useEffect, useState } from 'react'
import type { ApiHospitalizationStay, HospitalizationInvoice } from '../types/hospitalizacion.types'
import { fetchHospitalizationInvoice, fetchPendingPaymentStays } from '../services/hospitalizacionService'
import { formatInvoiceCurrency } from '../utils/hospitalizacionInvoiceUtils'
import { ReloadIcon } from '@/global/components'

interface HospitalizacionPendientesPagoViewProps {
  canView?: boolean
  onSelectStay?: (stayId: string) => void
  searchTerm?: string
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function HospitalizacionPendientesPagoView({
  canView = true,
  onSelectStay,
  searchTerm = '',
}: HospitalizacionPendientesPagoViewProps) {
  const [stays, setStays] = useState<ApiHospitalizationStay[]>([])
  const [invoices, setInvoices] = useState<Record<string, HospitalizationInvoice>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchPendingPaymentStays()
      setStays(data || [])
      const invoiceEntries = await Promise.all(
        (data || []).map(async (stay) => {
          try {
            return [stay.id, await fetchHospitalizationInvoice(stay.id)] as const
          } catch {
            return null
          }
        }),
      )
      setInvoices(Object.fromEntries(invoiceEntries.filter(Boolean) as Array<readonly [string, HospitalizationInvoice]>))
    } catch {
      setError('No se pudieron cargar las estancias pendientes de pago.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (canView) void load()
  }, [canView])

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredStays = stays.filter((stay) => {
    if (!normalizedSearchTerm) return true

    const pet = (stay.petName || '').toLowerCase()
    const owner = (stay.ownerName || '').toLowerCase()
    const motivo = (stay.motivo || '').toLowerCase()

    return (
      pet.includes(normalizedSearchTerm) ||
      owner.includes(normalizedSearchTerm) ||
      motivo.includes(normalizedSearchTerm)
    )
  })

  if (!canView) return null

  return (
    <div className="bg-white border border-border-tan rounded-2xl shadow-xs overflow-hidden">
      {isLoading ? (
        <div className="p-12 text-center text-sage text-sm">
          <div className="w-8 h-8 border-3 border-brand/30 border-t-brand rounded-full animate-spin inline-block" />
          <p className="font-semibold text-charcoal mt-3">Cargando pendientes de pago…</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-3">
          <p className="text-sm font-bold text-danger">{error}</p>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold">
            <ReloadIcon className="w-4 h-4" /> Reintentar
          </button>
        </div>
      ) : stays.length === 0 ? (
        <div className="p-12 text-center text-sage text-sm">
          No hay estancias dadas de alta.
        </div>
      ) : filteredStays.length === 0 ? (
        <div className="p-12 text-center text-sage text-sm">
          No hay estancias pendientes que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-bone border-b border-border-tan text-sage font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Mascota / Propietario</th>
                <th className="py-3 px-3">Fecha de alta</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-tan/60 text-charcoal">
              {filteredStays.map((stay) => (
                <tr key={stay.id} className="hover:bg-bone/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-brand block">{stay.petName || 'Mascota'}</span>
                    <span className="text-[11px] text-sage block mt-0.5">{stay.ownerName || '—'}</span>
                  </td>
                  <td className="py-3 px-3 text-sage whitespace-nowrap">{formatDate(stay.dischargedAt)}</td>
                  <td className="py-3 px-3 font-bold text-charcoal whitespace-nowrap">
                    {invoices[stay.id] ? formatInvoiceCurrency(invoices[stay.id].total) : '—'}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      stay.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {stay.isPaid ? 'Pagada' : 'Pendiente de pago'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {onSelectStay && (
                      <button type="button" onClick={() => onSelectStay(stay.id)} className="px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition">
                        Ver liquidación
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
