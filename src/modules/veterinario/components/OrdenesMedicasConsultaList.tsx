import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import {
  fetchMedicationOrdersByAppointment,
  fetchProcedureOrdersByAppointment,
  type ApiMedicationOrder,
  type ApiProcedureOrder,
} from '../services/ordenesMedicasService'
import { OrdenMedicaPrintModal, type PrintOrderType } from './OrdenMedicaPrintModal'
import { CompletarOrdenModal, type CompleteOrderType } from './CompletarOrdenModal'
import { PrinterIcon, CheckIcon, PillIcon, MedicalFolderIcon } from '@/global/components'

export interface UnifiedOrder {
  id: string
  type: 'MEDICAMENTO' | 'PROCEDIMIENTO'
  orderObject: ApiMedicationOrder | ApiProcedureOrder
  isInHouse: boolean
  status: string
  createdAt: string
  itemsCount: number
}

export interface OrdenesMedicasConsultaListRef {
  reload: () => Promise<void>
}

interface OrdenesMedicasConsultaListProps {
  appointmentId: string
  petName: string
  speciesBreed?: string
  ownerName?: string
  veterinarianName?: string
  canEditPermission?: boolean
}

export const OrdenesMedicasConsultaList = forwardRef<
  OrdenesMedicasConsultaListRef,
  OrdenesMedicasConsultaListProps
>(({ appointmentId, petName, speciesBreed, ownerName, veterinarianName, canEditPermission = true }, ref) => {
  const [medicationOrders, setMedicationOrders] = useState<ApiMedicationOrder[]>([])
  const [procedureOrders, setProcedureOrders] = useState<ApiProcedureOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Estados de modales
  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean
    orderType: PrintOrderType
    medicationOrder?: ApiMedicationOrder | null
    procedureOrder?: ApiProcedureOrder | null
  }>({ isOpen: false, orderType: 'MEDICAMENTO' })

  const [completeModalState, setCompleteModalState] = useState<{
    isOpen: boolean
    orderType: CompleteOrderType
    medicationOrder?: ApiMedicationOrder | null
    procedureOrder?: ApiProcedureOrder | null
  }>({ isOpen: false, orderType: 'MEDICAMENTO' })

  const loadOrders = async () => {
    if (!appointmentId) return
    setIsLoading(true)
    try {
      const [meds, procs] = await Promise.all([
        fetchMedicationOrdersByAppointment(appointmentId),
        fetchProcedureOrdersByAppointment(appointmentId),
      ])
      setMedicationOrders(meds)
      setProcedureOrders(procs)
    } catch {
      // Silently fail or fallback
    } finally {
      setIsLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    reload: loadOrders,
  }))

  useEffect(() => {
    void loadOrders()
  }, [appointmentId])

  // Unir ambas listas en el frontend (ordenadas por fecha descendente)
  const unifiedOrders: UnifiedOrder[] = [
    ...medicationOrders.map(
      (m): UnifiedOrder => ({
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
      (p): UnifiedOrder => ({
        id: p.id,
        type: 'PROCEDIMIENTO',
        orderObject: p,
        isInHouse: p.isInHouse,
        status: p.status,
        createdAt: p.createdAt,
        itemsCount: p.items?.length || 0,
      }),
    ),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleOpenPrint = (item: UnifiedOrder) => {
    if (item.type === 'MEDICAMENTO') {
      setPrintModalState({
        isOpen: true,
        orderType: 'MEDICAMENTO',
        medicationOrder: item.orderObject as ApiMedicationOrder,
      })
    } else {
      setPrintModalState({
        isOpen: true,
        orderType: 'PROCEDIMIENTO',
        procedureOrder: item.orderObject as ApiProcedureOrder,
      })
    }
  }

  const handleOpenComplete = (item: UnifiedOrder) => {
    if (item.type === 'MEDICAMENTO') {
      setCompleteModalState({
        isOpen: true,
        orderType: 'MEDICAMENTO',
        medicationOrder: item.orderObject as ApiMedicationOrder,
      })
    } else {
      setCompleteModalState({
        isOpen: true,
        orderType: 'PROCEDIMIENTO',
        procedureOrder: item.orderObject as ApiProcedureOrder,
      })
    }
  }

  if (isLoading) {
    return <div className="text-xs text-sage py-3 text-center">Cargando órdenes de la consulta…</div>
  }

  if (unifiedOrders.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border-tan text-center text-xs text-sage">
        No hay órdenes médicas asociadas a esta consulta aún.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="divide-y divide-border-tan/60 border border-border-tan rounded-xl bg-white overflow-hidden">
        {unifiedOrders.map((ord) => {
          const isMed = ord.type === 'MEDICAMENTO'
          const isDone = ord.status === 'Entregada' || ord.status === 'Completada'

          return (
            <div key={ord.id} className="p-3.5 space-y-2 hover:bg-bone/40 transition">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isMed ? 'bg-sage-soft text-brand' : 'bg-cream text-brand border border-border-tan'
                    }`}
                  >
                    {isMed ? <PillIcon className="w-3.5 h-3.5" /> : <MedicalFolderIcon className="w-3.5 h-3.5" />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-charcoal text-xs truncate">
                        Orden de {isMed ? 'Medicamentos' : 'Procedimiento'}
                      </span>
                      <span className="text-[10px] font-bold text-sage">
                        · {ord.isInHouse ? 'Interna' : 'Remitida'}
                      </span>
                    </div>
                    <span className="text-[10px] text-sage block">
                      {new Date(ord.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isDone
                        ? 'bg-sage-soft text-brand border border-brand/20'
                        : 'bg-amber-100/80 text-amber-900 border border-amber-300/60'
                    }`}
                  >
                    {ord.status}
                  </span>

                  {/* Acciones */}
                  <button
                    type="button"
                    onClick={() => handleOpenPrint(ord)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border-tan bg-white text-xs font-bold text-charcoal hover:bg-bone hover:text-brand transition cursor-pointer"
                    title="Imprimir Orden"
                  >
                    <PrinterIcon className="w-3.5 h-3.5 text-sage" />
                    <span>Imprimir</span>
                  </button>

                  {canEditPermission && !isDone && (
                    <button
                      type="button"
                      onClick={() => handleOpenComplete(ord)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs"
                      title="Completar Orden"
                    >
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>Completar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Detalle o ítems de la orden */}
              <div className="pl-9 text-xs text-charcoal/90">
                {ord.isInHouse ? (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">
                      Ítems ({ord.itemsCount}):
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-xs">
                      {isMed
                        ? (ord.orderObject as ApiMedicationOrder).items.map((i) => (
                            <li key={i.id}>
                              <span className="font-semibold text-brand">
                                {i.medicationName || 'Medicamento'}
                              </span>
                              {i.notes && <span className="text-sage font-normal"> — {i.notes}</span>}
                            </li>
                          ))
                        : (ord.orderObject as ApiProcedureOrder).items.map((i) => (
                            <li key={i.id}>
                              <span className="font-semibold text-brand">
                                {i.procedureName || 'Procedimiento'}
                              </span>
                              {i.notes && <span className="text-sage font-normal"> — {i.notes}</span>}
                            </li>
                          ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-bone/70 border border-border-tan/70 space-y-1">
                    <p className="text-xs">
                      <span className="font-bold text-sage">Remitido a:</span>{' '}
                      <span className="font-bold text-charcoal">{ord.orderObject.referredTo}</span>
                    </p>
                    <p className="text-xs">
                      <span className="font-bold text-sage">Motivo:</span> {ord.orderObject.referralReason}
                    </p>
                  </div>
                )}

                {!isMed && (ord.orderObject as ApiProcedureOrder).resultFileUrl && (
                  <div className="mt-1.5 text-xs text-brand font-semibold">
                    <span>Resultado: </span>
                    <a
                      href={(ord.orderObject as ApiProcedureOrder).resultFileUrl!}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-brand-hover"
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

      {/* Modal Imprimir */}
      <OrdenMedicaPrintModal
        isOpen={printModalState.isOpen}
        orderType={printModalState.orderType}
        medicationOrder={printModalState.medicationOrder}
        procedureOrder={printModalState.procedureOrder}
        petName={petName}
        speciesBreed={speciesBreed}
        ownerName={ownerName}
        veterinarianName={veterinarianName}
        onClose={() => setPrintModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Modal Completar */}
      <CompletarOrdenModal
        isOpen={completeModalState.isOpen}
        orderType={completeModalState.orderType}
        medicationOrder={completeModalState.medicationOrder}
        procedureOrder={completeModalState.procedureOrder}
        onClose={() => setCompleteModalState((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={loadOrders}
      />
    </div>
  )
})

OrdenesMedicasConsultaList.displayName = 'OrdenesMedicasConsultaList'
