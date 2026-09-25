import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  fetchMedicationOrdersByStay,
  fetchProcedureOrdersByStay,
  type ApiMedicationOrder,
  type ApiProcedureOrder,
} from '@/modules/veterinario/services/ordenesMedicasService'
import {
  AnexarOrdenMedicaModal,
  type MedicalOrderType,
} from '@/modules/veterinario/components/AnexarOrdenMedicaModal'
import {
  OrdenMedicaPrintModal,
  type PrintOrderType,
} from '@/modules/veterinario/components/OrdenMedicaPrintModal'
import {
  CompletarOrdenModal,
  type CompleteOrderType,
} from '@/modules/veterinario/components/CompletarOrdenModal'
import { PillIcon, CheckIcon, PrinterIcon, PlusIcon } from '@/global/components'
import { MedicalFolderIcon } from '@/modules/veterinario/components/MascotasIcons'

export interface UnifiedStayOrder {
  id: string
  type: 'MEDICAMENTO' | 'PROCEDIMIENTO'
  orderObject: ApiMedicationOrder | ApiProcedureOrder
  isInHouse: boolean
  status: string
  createdAt: string
  itemsCount: number
}

export interface HospitalizacionOrdenesPanelProps {
  stayId: string
  clientPetId?: string
  petName?: string
  ownerName?: string
  speciesBreed?: string
  veterinarianName?: string
  isDischarged?: boolean
  isStayLoading?: boolean
  canViewOrders?: boolean
  canCreateOrders?: boolean
  canEditOrders?: boolean
  onOrderUpdated?: () => void
}

export function HospitalizacionOrdenesPanel({
  stayId,
  clientPetId,
  petName,
  ownerName,
  speciesBreed,
  veterinarianName,
  isDischarged = false,
  isStayLoading = false,
  canViewOrders = true,
  canCreateOrders = false,
  canEditOrders = false,
  onOrderUpdated,
}: HospitalizacionOrdenesPanelProps) {
  const [medicationOrders, setMedicationOrders] = useState<ApiMedicationOrder[]>([])
  const [procedureOrders, setProcedureOrders] = useState<ApiProcedureOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Modal Crear Orden
  const [createModalState, setCreateModalState] = useState<{
    isOpen: boolean
    orderType: MedicalOrderType
  }>({ isOpen: false, orderType: 'MEDICAMENTO' })

  // Modal Imprimir Orden
  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean
    orderType: PrintOrderType
    medicationOrder?: ApiMedicationOrder | null
    procedureOrder?: ApiProcedureOrder | null
  }>({ isOpen: false, orderType: 'MEDICAMENTO' })

  // Modal Completar / Entregar Orden
  const [completeModalState, setCompleteModalState] = useState<{
    isOpen: boolean
    orderType: CompleteOrderType
    medicationOrder?: ApiMedicationOrder | null
    procedureOrder?: ApiProcedureOrder | null
  }>({ isOpen: false, orderType: 'MEDICAMENTO' })

  const loadOrders = useCallback(async () => {
    if (!canViewOrders || !stayId) return

    setIsLoading(true)
    setErrorMsg(null)

    try {
      const [meds, procs] = await Promise.all([
        fetchMedicationOrdersByStay(stayId),
        fetchProcedureOrdersByStay(stayId),
      ])
      setMedicationOrders(meds || [])
      setProcedureOrders(procs || [])
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string }
      setErrorMsg(
        apiErr.response?.data?.message ||
          apiErr.message ||
          'No se pudieron cargar las órdenes médicas de la estancia.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [canViewOrders, stayId])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  // Lista unificada ordenada por fecha de creación descendente
  const unifiedOrders = useMemo<UnifiedStayOrder[]>(() => {
    const list: UnifiedStayOrder[] = [
      ...medicationOrders.map(
        (m): UnifiedStayOrder => ({
          id: m.id,
          type: 'MEDICAMENTO',
          orderObject: m,
          isInHouse: m.isInHouse,
          status: m.status,
          createdAt: m.createdAt,
          itemsCount: m.items?.length || 0,
        }),
      ),
      ...procedureOrders.map(
        (p): UnifiedStayOrder => ({
          id: p.id,
          type: 'PROCEDIMIENTO',
          orderObject: p,
          isInHouse: p.isInHouse,
          status: p.status,
          createdAt: p.createdAt,
          itemsCount: p.items?.length || 0,
        }),
      ),
    ]

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [medicationOrders, procedureOrders])

  const handleOpenPrint = (ord: UnifiedStayOrder) => {
    if (ord.type === 'MEDICAMENTO') {
      setPrintModalState({
        isOpen: true,
        orderType: 'MEDICAMENTO',
        medicationOrder: ord.orderObject as ApiMedicationOrder,
      })
    } else {
      setPrintModalState({
        isOpen: true,
        orderType: 'PROCEDIMIENTO',
        procedureOrder: ord.orderObject as ApiProcedureOrder,
      })
    }
  }

  const handleOpenComplete = (ord: UnifiedStayOrder) => {
    if (ord.type === 'MEDICAMENTO') {
      setCompleteModalState({
        isOpen: true,
        orderType: 'MEDICAMENTO',
        medicationOrder: ord.orderObject as ApiMedicationOrder,
      })
    } else {
      setCompleteModalState({
        isOpen: true,
        orderType: 'PROCEDIMIENTO',
        procedureOrder: ord.orderObject as ApiProcedureOrder,
      })
    }
  }

  const handleOrderCreated = () => {
    void loadOrders()
    onOrderUpdated?.()
  }

  const handleOrderCompleted = () => {
    void loadOrders()
    onOrderUpdated?.()
  }

  // Si no tiene permiso de visualización de órdenes
  if (!canViewOrders) {
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
        <h3 className="text-sm font-bold text-charcoal">Órdenes médicas</h3>
        <p className="text-xs text-sage max-w-sm">
          No tienes permisos suficientes (Órdenes Médicas:View) para consultar las órdenes médicas de esta estancia.
        </p>
      </div>
    )
  }

  const showCreateActions = canCreateOrders && !isDischarged && !isStayLoading

  return (
    <div className="bg-white rounded-2xl border border-warm-grey/40 shadow-xs overflow-hidden flex flex-col">
      {/* Panel Header */}
      <div className="px-6 py-4.5 border-b border-warm-grey/30 bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage-soft text-brand flex items-center justify-center shrink-0">
            <PillIcon className="w-5 h-5 text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-charcoal tracking-tight">
                Órdenes médicas de hospitalización
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-bone text-sage rounded-full border border-warm-grey/40">
                {unifiedOrders.length} {unifiedOrders.length === 1 ? 'orden' : 'órdenes'}
              </span>
            </div>
            <p className="text-xs text-sage mt-0.5">
              Medicamentos formulados y procedimientos clínicos prescritos durante la estancia.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
          {/* Botones Nueva Orden */}
          {showCreateActions && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCreateModalState({ isOpen: true, orderType: 'MEDICAMENTO' })}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-brand-hover transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Nueva orden de medicamento</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateModalState({ isOpen: true, orderType: 'PROCEDIMIENTO' })}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-brand/30 bg-white text-brand hover:bg-sage-soft transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Nueva orden de procedimiento</span>
              </button>
            </div>
          )}

          {isDischarged && (
            <span className="px-3 py-1.5 text-xs font-medium bg-bone text-sage border border-warm-grey/40 rounded-xl">
              Estancia dada de alta (Sólo lectura)
            </span>
          )}
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-brand/30 border-t-brand rounded-full animate-spin" />
            <p className="text-xs text-sage font-medium">Cargando órdenes médicas de la estancia…</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMsg && (
          <div className="p-4 bg-terracotta-soft/30 border border-terracotta/30 rounded-xl flex items-center justify-between gap-3 text-xs text-terracotta">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="px-3 py-1 bg-white border border-terracotta/40 rounded-lg font-medium hover:bg-terracotta-soft transition cursor-pointer shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMsg && unifiedOrders.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-bone border border-warm-grey/40 flex items-center justify-center text-sage">
              <PillIcon className="w-6 h-6 opacity-60 text-sage" />
            </div>
            <div>
              <p className="text-sm font-bold text-charcoal">
                No hay órdenes médicas prescritas en esta estancia
              </p>
              <p className="text-xs text-sage mt-1 max-w-sm">
                Los medicamentos y procedimientos formulados aparecerán aquí y se reflejarán en la liquidación una vez entregados o completados.
              </p>
            </div>
            {showCreateActions && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalState({ isOpen: true, orderType: 'MEDICAMENTO' })}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-brand-hover transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Prescribir medicamento</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateModalState({ isOpen: true, orderType: 'PROCEDIMIENTO' })}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border-tan bg-white text-charcoal hover:bg-bone transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Solicitar procedimiento</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !errorMsg && unifiedOrders.length > 0 && (
          <div className="divide-y divide-border-tan/60 border border-border-tan rounded-xl bg-white overflow-hidden">
            {unifiedOrders.map((ord) => {
              const isMed = ord.type === 'MEDICAMENTO'
              const isDone = ord.status === 'Entregada' || ord.status === 'Completada'
              const canEditThisOrder = canEditOrders && !isDischarged && !isDone

              return (
                <div key={`${ord.type}-${ord.id}`} className="p-4 space-y-3 hover:bg-bone/30 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isMed
                            ? 'bg-sage-soft text-brand'
                            : 'bg-cream text-brand border border-border-tan'
                        }`}
                      >
                        {isMed ? (
                          <PillIcon className="w-4 h-4" />
                        ) : (
                          <MedicalFolderIcon className="w-4 h-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-charcoal text-xs sm:text-sm truncate">
                            Orden de {isMed ? 'Medicamentos' : 'Procedimiento'}
                          </span>
                          <span className="text-[10px] font-bold text-sage">
                            · {ord.isInHouse ? 'Interna' : 'Remisión Externa'}
                          </span>
                        </div>
                        <span className="text-[11px] text-sage block mt-0.5">
                          Prescrita:{' '}
                          {new Date(ord.createdAt).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isDone
                            ? 'bg-sage-soft text-brand border border-brand/20'
                            : 'bg-amber-100/80 text-amber-900 border border-amber-300/60'
                        }`}
                      >
                        {ord.status}
                      </span>

                      {/* Botón Imprimir */}
                      <button
                        type="button"
                        onClick={() => handleOpenPrint(ord)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-tan bg-white text-xs font-bold text-charcoal hover:bg-bone hover:text-brand transition cursor-pointer"
                        title="Imprimir Orden"
                      >
                        <PrinterIcon className="w-3.5 h-3.5 text-sage" />
                        <span>Imprimir</span>
                      </button>

                      {/* Botón Entregar / Completar */}
                      {canEditThisOrder && (
                        <button
                          type="button"
                          onClick={() => handleOpenComplete(ord)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs"
                          title={isMed ? 'Marcar como Entregada' : 'Marcar como Completada'}
                        >
                          <CheckIcon className="w-3.5 h-3.5" />
                          <span>{isMed ? 'Entregar' : 'Completar'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items or Referral Details */}
                  <div className="pl-11 text-xs text-charcoal/90">
                    {ord.isInHouse ? (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">
                          Ítems formulados ({ord.itemsCount}):
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                          {isMed
                            ? (ord.orderObject as ApiMedicationOrder).items?.map((i) => (
                                <li key={i.id}>
                                  <span className="font-semibold text-brand">
                                    {i.medicationName || 'Medicamento'}
                                  </span>
                                  {i.notes && (
                                    <span className="text-sage font-normal"> — {i.notes}</span>
                                  )}
                                </li>
                              ))
                            : (ord.orderObject as ApiProcedureOrder).items?.map((i) => (
                                <li key={i.id}>
                                  <span className="font-semibold text-brand">
                                    {i.procedureName || 'Procedimiento'}
                                  </span>
                                  {i.notes && (
                                    <span className="text-sage font-normal"> — {i.notes}</span>
                                  )}
                                </li>
                              ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-bone/70 border border-border-tan/70 space-y-1">
                        <p className="text-xs">
                          <span className="font-bold text-sage">Remitido a:</span>{' '}
                          <span className="font-bold text-charcoal">
                            {ord.orderObject.referredTo || 'No especificado'}
                          </span>
                        </p>
                        <p className="text-xs">
                          <span className="font-bold text-sage">Motivo:</span>{' '}
                          {ord.orderObject.referralReason || 'No especificado'}
                        </p>
                      </div>
                    )}

                    {!isMed && (ord.orderObject as ApiProcedureOrder).resultFileUrl && (
                      <div className="mt-2 text-xs text-brand font-semibold flex items-center gap-1.5">
                        <span>Archivo de resultado:</span>
                        <a
                          href={(ord.orderObject as ApiProcedureOrder).resultFileUrl!}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-brand-hover text-brand-dark"
                        >
                          {(ord.orderObject as ApiProcedureOrder).resultFileUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Anexar Orden Médica */}
      {createModalState.isOpen && (
        <AnexarOrdenMedicaModal
          isOpen={createModalState.isOpen}
          orderType={createModalState.orderType}
          clientPetId={clientPetId || ''}
          hospitalizationStayId={stayId}
          appointmentId={null}
          petName={petName || 'Paciente'}
          onClose={() => setCreateModalState((prev) => ({ ...prev, isOpen: false }))}
          onSuccess={handleOrderCreated}
        />
      )}

      {/* Modal Imprimir */}
      {printModalState.isOpen && (
        <OrdenMedicaPrintModal
          isOpen={printModalState.isOpen}
          orderType={printModalState.orderType}
          medicationOrder={printModalState.medicationOrder}
          procedureOrder={printModalState.procedureOrder}
          petName={petName || 'Paciente'}
          speciesBreed={speciesBreed}
          ownerName={ownerName}
          veterinarianName={veterinarianName}
          onClose={() => setPrintModalState((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* Modal Completar / Entregar */}
      {completeModalState.isOpen && (
        <CompletarOrdenModal
          isOpen={completeModalState.isOpen}
          orderType={completeModalState.orderType}
          medicationOrder={completeModalState.medicationOrder}
          procedureOrder={completeModalState.procedureOrder}
          onClose={() => setCompleteModalState((prev) => ({ ...prev, isOpen: false }))}
          onSuccess={handleOrderCompleted}
        />
      )}
    </div>
  )
}
