import { useState, useEffect } from 'react'
import {
  fetchActiveStays,
} from '../services/hospitalizacionService'
import type { ApiHospitalizationStay } from '../types/hospitalizacion.types'
import {
  calculateStayDays,
  formatStayDays,
} from '../utils/hospitalizacionDays'
import { AdmitirMascotaModal } from './AdmitirMascotaModal'
import {
  SearchIcon,
  PlusIcon,
  CalendarIcon,
  ReloadIcon,
  PageToast,
  type PageToastTone,
} from '@/global/components'

export interface HospitalizacionListaViewProps {
  canView?: boolean
  canCreate?: boolean
  canEdit?: boolean
  onSelectStay?: (stayId: string) => void
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function HospitalizacionListaView({
  canView = true,
  canCreate = false,
  canEdit: _canEdit = false,
  onSelectStay,
}: HospitalizacionListaViewProps) {
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-warm-grey/40 text-center gap-3">
        <p className="text-base font-bold text-charcoal">Acceso Restringido</p>
        <p className="text-sm text-sage">
          No tienes permisos para visualizar el módulo de hospitalización.
        </p>
      </div>
    )
  }
  const [stays, setStays] = useState<ApiHospitalizationStay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false)

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastTone, setToastTone] = useState<PageToastTone>('success')

  const showToast = (message: string, tone: PageToastTone = 'success') => {
    setToastMessage(message)
    setToastTone(tone)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  const loadStays = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await fetchActiveStays()
      setStays(data || [])
    } catch {
      setLoadError('Error al cargar la lista de estancias activas.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadStays()
  }, [])

  const filteredStays = stays.filter((stay) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    const pet = (stay.petName || '').toLowerCase()
    const owner = (stay.ownerName || '').toLowerCase()
    const motivo = (stay.motivo || '').toLowerCase()
    return pet.includes(term) || owner.includes(term) || motivo.includes(term)
  })

  return (
    <div className="flex flex-col gap-5 w-full">
      {toastMessage && (
        <PageToast
          message={toastMessage}
          tone={toastTone}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            Hospitalización
          </h1>
          <p className="text-sm text-sage mt-1">
            Gestión de pacientes hospitalizados y seguimiento clínico.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setIsAdmitModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Admitir Mascota</span>
          </button>
        )}
      </div>

      {/* Control de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border-tan shadow-xs">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage" />
          <input
            type="text"
            placeholder="Buscar por paciente, propietario o motivo…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-tan bg-bone text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sage bg-bone px-3 py-1.5 rounded-xl border border-border-tan">
            Estancias activas: {isLoading ? '…' : stays.length}
          </span>
          <button
            type="button"
            onClick={() => void loadStays()}
            disabled={isLoading}
            className="p-2 rounded-xl border border-border-tan hover:bg-bone text-sage hover:text-brand transition cursor-pointer disabled:opacity-60"
            title="Refrescar lista"
          >
            <ReloadIcon className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabla de Estancias */}
      <div className="bg-white border border-border-tan rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sage text-sm space-y-3">
            <div className="w-8 h-8 border-3 border-brand/30 border-t-brand rounded-full animate-spin inline-block" />
            <p className="font-semibold text-charcoal text-sm">Cargando estancias hospitalarias activas…</p>
            <p className="text-xs text-sage font-medium">Obteniendo pacientes ingresados a hospitalización</p>
          </div>
        ) : loadError ? (
          <div className="p-8 text-center space-y-3 bg-danger-soft/40">
            <p className="text-sm font-bold text-danger">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadStays()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs"
            >
              <ReloadIcon className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
          </div>
        ) : filteredStays.length === 0 ? (
          <div className="p-12 text-center text-sage space-y-3">
            <p className="text-sm font-semibold text-charcoal">
              {searchTerm
                ? 'No se encontraron estancias que coincidan con la búsqueda.'
                : 'No hay pacientes hospitalizados en este momento.'}
            </p>
            {canCreate && !searchTerm && (
              <button
                type="button"
                onClick={() => setIsAdmitModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Admitir primer paciente</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-bone border-b border-border-tan text-sage font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">Paciente / Mascota</th>
                  <th className="p-3.5">Propietario</th>
                  <th className="p-3.5">Motivo de Hospitalización</th>
                  <th className="p-3.5">Fecha de Ingreso</th>
                  <th className="p-3.5">Días Internado</th>
                  <th className="p-3.5">Responsable</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 pr-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-tan/60 text-charcoal">
                {filteredStays.map((stay) => {
                  const days = calculateStayDays(stay.admittedAt, stay.dischargedAt)
                  const daysFormatted = formatStayDays(days)

                  return (
                    <tr key={stay.id} className="hover:bg-bone/40 transition">
                      <td className="p-3.5 pl-5">
                        <span className="font-extrabold text-brand block">
                          {stay.petName || 'Mascota'}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-charcoal">
                        {stay.ownerName || '—'}
                      </td>
                      <td className="p-3.5 max-w-xs truncate font-medium text-charcoal">
                        <span title={stay.motivo}>{stay.motivo || '—'}</span>
                      </td>
                      <td className="p-3.5 text-sage font-medium whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-sage" />
                          {formatDate(stay.admittedAt)}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            days >= 3
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-sage-soft text-brand'
                          }`}
                        >
                          {daysFormatted}
                        </span>
                      </td>
                      <td className="p-3.5 text-sage whitespace-nowrap">
                        {stay.admittedByName || 'Veterinario'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            stay.status === 'Activa'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-bone text-sage border border-border-tan'
                          }`}
                        >
                          {stay.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        {onSelectStay && (
                          <button
                            type="button"
                            onClick={() => onSelectStay(stay.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer shadow-2xs"
                          >
                            <span>Ver Hoja</span>
                            <span>→</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Admisión */}
      {isAdmitModalOpen && (
        <AdmitirMascotaModal
          isOpen={isAdmitModalOpen}
          onClose={() => setIsAdmitModalOpen(false)}
          onSuccess={() => {
            showToast('Mascota admitida a hospitalización exitosamente.')
            void loadStays()
          }}
        />
      )}
    </div>
  )
}
