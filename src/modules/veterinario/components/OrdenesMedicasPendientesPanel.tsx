import { useState, useEffect } from 'react'
import {
  fetchPendingMedicationOrders,
  fetchPendingProcedureOrders,
  type ApiMedicationOrder,
  type ApiProcedureOrder,
  type PendingMedicationOrder,
  type PendingProcedureOrder,
} from '../services/ordenesMedicasService'
import {
  buildUnifiedPendingOrders,
  filterPendingOrders,
  type PendingOrderFilterType,
} from '../utils/pendingOrdersView'
import { OrdenMedicaPrintModal, type PrintOrderType } from './OrdenMedicaPrintModal'
import { CompletarOrdenModal, type CompleteOrderType } from './CompletarOrdenModal'
import { PrinterIcon, CheckIcon, PillIcon, Pagination } from '@/global/components'
import { MedicalFolderIcon } from './MascotasIcons'

export type { UnifiedPendingOrder } from '../utils/pendingOrdersView'

export interface OrdenesMedicasPendientesPanelProps {
  canEdit?: boolean
}

export function OrdenesMedicasPendientesPanel({ canEdit = true }: OrdenesMedicasPendientesPanelProps) {
  const [medicationOrders, setMedicationOrders] = useState<PendingMedicationOrder[]>([])
  const [procedureOrders, setProcedureOrders] = useState<PendingProcedureOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterType, setFilterType] = useState<PendingOrderFilterType>('TODOS')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchQuery])

  // Estados de modales
  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean
    orderType: PrintOrderType
    medicationOrder?: ApiMedicationOrder | null
    procedureOrder?: ApiProcedureOrder | null
    petName?: string
    ownerName?: string
  }>({ isOpen: false, orderType: 'MEDICAMENTO' })

  const [completeModalState, setCompleteModalState] = useState<{
    isOpen: boolean
    orderType: CompleteOrderType
    medicationOrder?: ApiMedicationOrder | null
    procedureOrder?: ApiProcedureOrder | null
  }>({ isOpen: false, orderType: 'MEDICAMENTO' })

  const loadPendingOrders = async () => {
    setIsLoading(true)
    try {
      const [meds, procs] = await Promise.all([
        fetchPendingMedicationOrders(),
        fetchPendingProcedureOrders(),
      ])
      setMedicationOrders(meds)
      setProcedureOrders(procs)
    } catch {
      // Error silencioso con fallback
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadPendingOrders()
  }, [])

  // Combinar ambas listas
  const unifiedPending = buildUnifiedPendingOrders(medicationOrders, procedureOrders)

  // Filtrar resultados
  const filteredOrders = filterPendingOrders(unifiedPending, filterType, searchQuery)
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Convertir PendingMedicationOrder a ApiMedicationOrder para modal de impresión y completar
  const toApiMedicationOrder = (p: PendingMedicationOrder): ApiMedicationOrder => ({
    id: p.id,
    clientPetId: '',
    veterinarianId: '',
    appointmentId: p.appointmentId,
    isInHouse: p.isInHouse,
    status: p.status,
    createdAt: p.createdAt,
    items: p.items || [],
  })

  const toApiProcedureOrder = (p: PendingProcedureOrder): ApiProcedureOrder => ({
    id: p.id,
    clientPetId: '',
    veterinarianId: '',
    appointmentId: p.appointmentId,
    isInHouse: p.isInHouse,
    status: p.status,
    resultFileUrl: p.resultFileUrl,
    createdAt: p.createdAt,
    items: p.items || [],
  })

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="bg-white p-6 rounded-2xl border border-border-tan shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand flex items-center gap-2">
            <PillIcon className="w-6 h-6 text-brand" />
            Órdenes Médicas Pendientes
          </h2>
          <p className="text-sm text-brand/70">
            Cola general de medicamentos por entregar y procedimientos por realizar en la clínica.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Búsqueda */}
          <input
            type="text"
            placeholder="Buscar mascota o dueño..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-border-tan text-xs focus:outline-none focus:ring-2 focus:ring-brand/30 w-full sm:w-56"
          />

          {/* Filtro Tipo */}
          <div className="flex items-center gap-1 bg-sage-soft/40 p-1 rounded-xl border border-border-tan">
            <button
              type="button"
              onClick={() => setFilterType('TODOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === 'TODOS'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-brand hover:bg-white/60'
              }`}
            >
              Todos ({unifiedPending.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('MEDICAMENTO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === 'MEDICAMENTO'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-brand hover:bg-white/60'
              }`}
            >
              Medicamentos ({medicationOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('PROCEDIMIENTO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === 'PROCEDIMIENTO'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-brand hover:bg-white/60'
              }`}
            >
              Procedimientos ({procedureOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Estado Cargando */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-2xl border border-border-tan">
          <div className="animate-spin w-8 h-8 border-3 border-brand border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium text-brand/70">Cargando órdenes pendientes...</p>
        </div>
      )}

      {/* Lista Vacía */}
      {!isLoading && filteredOrders.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-border-tan">
          <PillIcon className="w-12 h-12 text-brand/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-brand">No hay órdenes pendientes</h3>
          <p className="text-xs text-brand/70 max-w-md mx-auto mt-1">
            {searchQuery
              ? 'No se encontraron órdenes que coincidan con la búsqueda.'
              : 'Excelente trabajo. Todas las órdenes médicas han sido procesadas o entregadas.'}
          </p>
        </div>
      )}

      {/* Grilla de Ordenes */}
      {!isLoading && filteredOrders.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedOrders.map((order) => {
              const isMed = order.type === 'MEDICAMENTO'
              const rawMed = order.rawMedicationOrder
              const rawProc = order.rawProcedureOrder

              return (
                <div
                  key={`${order.type}-${order.id}`}
                  className="bg-white rounded-2xl border border-border-tan p-5 shadow-xs flex flex-col justify-between hover:border-brand/30 transition"
                >
                  <div className="space-y-3">
                    {/* Encabezado Ítem */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isMed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isMed ? (
                            <PillIcon className="w-3.5 h-3.5" />
                          ) : (
                            <MedicalFolderIcon className="w-3.5 h-3.5" />
                          )}
                          {isMed ? 'Medicamento' : 'Procedimiento'}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            order.isInHouse
                              ? 'bg-sage-soft text-brand'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {order.isInHouse ? 'Interna' : 'Remitida'}
                        </span>
                      </div>

                      <span className="text-[11px] text-brand/60 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Datos Paciente y Dueño */}
                    <div className="bg-sage-soft/30 p-3 rounded-xl border border-border-tan/60">
                      <div className="text-sm font-bold text-brand">{order.petName}</div>
                      <div className="text-xs text-brand/70 font-medium">Dueño: {order.ownerName}</div>
                    </div>

                    {/* Detalle de Items */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-brand/80">Detalle de la Orden:</div>
                      {isMed && rawMed?.items && (
                        <ul className="text-xs space-y-1 pl-1">
                          {rawMed.items.map((item) => (
                            <li key={item.id} className="text-brand/90 flex items-start gap-1.5">
                              <span className="text-brand font-bold">•</span>
                              <div>
                                <span className="font-semibold">{item.medicationName || 'Medicamento'}</span>
                                {item.notes && (
                                  <span className="text-brand/70 italic block text-[11px]">
                                    Nota: {item.notes}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {!isMed && rawProc?.items && (
                        <ul className="text-xs space-y-1 pl-1">
                          {rawProc.items.map((item) => (
                            <li key={item.id} className="text-brand/90 flex items-start gap-1.5">
                              <span className="text-brand font-bold">•</span>
                              <div>
                                <span className="font-semibold">{item.procedureName || 'Procedimiento'}</span>
                                {item.notes && (
                                  <span className="text-brand/70 italic block text-[11px]">
                                    Nota: {item.notes}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="pt-4 mt-3 border-t border-border-tan/60 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isMed && rawMed) {
                          setPrintModalState({
                            isOpen: true,
                            orderType: 'MEDICAMENTO',
                            medicationOrder: toApiMedicationOrder(rawMed),
                            petName: rawMed.petName,
                            ownerName: rawMed.ownerName,
                          })
                        } else if (!isMed && rawProc) {
                          setPrintModalState({
                            isOpen: true,
                            orderType: 'PROCEDIMIENTO',
                            procedureOrder: toApiProcedureOrder(rawProc),
                            petName: rawProc.petName,
                            ownerName: rawProc.ownerName,
                          })
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-tan text-xs font-semibold text-brand hover:bg-sage-soft transition cursor-pointer"
                    >
                      <PrinterIcon className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isMed && rawMed) {
                            setCompleteModalState({
                              isOpen: true,
                              orderType: 'MEDICAMENTO',
                              medicationOrder: toApiMedicationOrder(rawMed),
                            })
                          } else if (!isMed && rawProc) {
                            setCompleteModalState({
                              isOpen: true,
                              orderType: 'PROCEDIMIENTO',
                              procedureOrder: toApiProcedureOrder(rawProc),
                            })
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition shadow-xs cursor-pointer"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                        <span>{isMed ? 'Entregar' : 'Completar'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-2xl border border-border-tan overflow-hidden">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="órdenes pendientes"
            />
          </div>
        </div>
      )}

      {/* Modal Impresión */}
      <OrdenMedicaPrintModal
        isOpen={printModalState.isOpen}
        onClose={() => setPrintModalState({ ...printModalState, isOpen: false })}
        orderType={printModalState.orderType}
        medicationOrder={printModalState.medicationOrder}
        procedureOrder={printModalState.procedureOrder}
        petName={printModalState.petName || 'Mascota'}
        ownerName={printModalState.ownerName || 'Cliente'}
      />

      {/* Modal Completar / Entregar */}
      <CompletarOrdenModal
        isOpen={completeModalState.isOpen}
        onClose={() => setCompleteModalState({ ...completeModalState, isOpen: false })}
        orderType={completeModalState.orderType}
        medicationOrder={completeModalState.medicationOrder}
        procedureOrder={completeModalState.procedureOrder}
        onSuccess={() => void loadPendingOrders()}
      />
    </div>
  )
}
