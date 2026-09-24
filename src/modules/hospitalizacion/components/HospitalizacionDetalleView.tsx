import { useState, useEffect, useCallback } from 'react'
import {
  fetchStayById,
  fetchStayNotes,
  addStayNote,
  dischargeStay,
  fetchStaff,
  fetchStaySupplyConsumptions,
} from '../services/hospitalizacionService'
import type {
  ApiHospitalizationStay,
  ApiHospitalizationNote,
  ApiStaffMember,
  ApiHospitalizationSupplyConsumption,
} from '../types/hospitalizacion.types'

import {
  fetchMedicationOrdersByStay,
  fetchProcedureOrdersByStay,
  completeMedicationOrder,
  completeProcedureOrder,
  cancelMedicationOrder,
  cancelProcedureOrder,
  type ApiMedicationOrder,
  type ApiProcedureOrder,
} from '@/modules/veterinario/services/ordenesMedicasService'
import {
  calculateHospitalizationLiquidation,
  formatLiquidationCurrency,
  isMedicationOrderDelivered,
  isProcedureOrderCompleted,
} from '../utils/hospitalizacionLiquidation'
import { isStayActive } from '../utils/hospitalizacionView'
import { AnexarOrdenMedicaModal, type MedicalOrderType } from '@/modules/veterinario/components/AnexarOrdenMedicaModal'
import { RegistrarConsumoInsumoModal } from './RegistrarConsumoInsumoModal'
import {
  PageToast,
  PlusIcon,
  PillIcon,
  StethoscopeIcon,
  PackageIcon,
  CalendarIcon,
  UserAvatarIcon,
  ReloadIcon,
} from '@/global/components'

export interface HospitalizacionDetalleViewProps {
  stayId: string
  canEdit?: boolean
  onBack?: () => void
}

type OrderFilterTab = 'all' | 'medications' | 'procedures'

export function HospitalizacionDetalleView({
  stayId,
  canEdit = true,
  onBack,
}: HospitalizacionDetalleViewProps) {
  // Estado principal
  const [stay, setStay] = useState<ApiHospitalizationStay | null>(null)
  const [notes, setNotes] = useState<ApiHospitalizationNote[]>([])
  const [medicationOrders, setMedicationOrders] = useState<ApiMedicationOrder[]>([])
  const [procedureOrders, setProcedureOrders] = useState<ApiProcedureOrder[]>([])
  const [supplies, setSupplies] = useState<ApiHospitalizationSupplyConsumption[]>([])
  const [staffList, setStaffList] = useState<ApiStaffMember[]>([])

  // Estados de carga y error
  const [isLoadingStay, setIsLoadingStay] = useState(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'danger'>('success')

  // Modales
  const [orderModalType, setOrderModalType] = useState<MedicalOrderType | null>(null)
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false)
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false)
  const [isDischarging, setIsDischarging] = useState(false)

  // Formulario de nueva nota
  const [newNoteText, setNewNoteText] = useState('')
  const [handedToUserId, setHandedToUserId] = useState('')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  // Filtro de órdenes
  const [orderFilter, setOrderFilter] = useState<OrderFilterTab>('all')

  const showToast = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadAllData = useCallback(async () => {
    setIsLoadingStay(true)
    setIsLoadingOrders(true)
    setLoadError(null)

    try {
      const stayData = await fetchStayById(stayId)
      setStay(stayData)

      // Cargar en paralelo datos adicionales
      const [loadedNotes, medOrders, procOrders, supps, staff] = await Promise.all([
        fetchStayNotes(stayId).catch(() => []),
        fetchMedicationOrdersByStay(stayId).catch(() => []),
        fetchProcedureOrdersByStay(stayId).catch(() => []),
        fetchStaySupplyConsumptions(stayId).catch(() => []),
        fetchStaff().catch(() => []),
      ])

      setNotes(loadedNotes)
      setMedicationOrders(medOrders)
      setProcedureOrders(procOrders)
      setSupplies(supps)
      setStaffList(staff)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los datos de la estancia hospitalaria.'
      setLoadError(msg)
    } finally {
      setIsLoadingStay(false)
      setIsLoadingOrders(false)
    }
  }, [stayId])

  useEffect(() => {
    void loadAllData()
  }, [loadAllData])

  const refreshOrdersAndSupplies = async () => {
    setIsLoadingOrders(true)
    try {
      const [medOrders, procOrders, supps] = await Promise.all([
        fetchMedicationOrdersByStay(stayId).catch(() => []),
        fetchProcedureOrdersByStay(stayId).catch(() => []),
        fetchStaySupplyConsumptions(stayId).catch(() => []),
      ])
      setMedicationOrders(medOrders)
      setProcedureOrders(procOrders)
      setSupplies(supps)
    } catch {
      // Ignorar
    } finally {
      setIsLoadingOrders(false)
    }
  }

  // Guardar nueva nota de evolución
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteText.trim()) return

    setIsSubmittingNote(true)
    try {
      await addStayNote(stayId, {
        nota: newNoteText.trim(),
        entregadoAUserId: handedToUserId || null,
      })
      showToast('Nota de evolución registrada correctamente.')
      setNewNoteText('')
      setHandedToUserId('')
      const updatedNotes = await fetchStayNotes(stayId)
      setNotes(updatedNotes)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la nota.'
      showToast(msg, 'danger')
    } finally {
      setIsSubmittingNote(false)
    }
  }

  // Marcar medicamento como entregado
  const handleDeliverMedication = async (orderId: string) => {
    try {
      await completeMedicationOrder(orderId)
      showToast('Medicamento marcado como entregado.')
      await refreshOrdersAndSupplies()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el medicamento.'
      showToast(msg, 'danger')
    }
  }

  // Marcar procedimiento como completado
  const handleCompleteProcedure = async (orderId: string) => {
    try {
      await completeProcedureOrder(orderId)
      showToast('Procedimiento marcado como completado.')
      await refreshOrdersAndSupplies()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al completar el procedimiento.'
      showToast(msg, 'danger')
    }
  }

  // Cancelar orden de medicamento
  const handleCancelMedication = async (orderId: string) => {
    try {
      await cancelMedicationOrder(orderId)
      showToast('Orden de medicamento cancelada.')
      await refreshOrdersAndSupplies()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cancelar la orden.'
      showToast(msg, 'danger')
    }
  }

  // Cancelar orden de procedimiento
  const handleCancelProcedure = async (orderId: string) => {
    try {
      await cancelProcedureOrder(orderId)
      showToast('Orden de procedimiento cancelada.')
      await refreshOrdersAndSupplies()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cancelar la orden.'
      showToast(msg, 'danger')
    }
  }

  // Confirmar alta médica
  const handleConfirmDischarge = async () => {
    setIsDischarging(true)
    try {
      await dischargeStay(stayId)
      showToast('Estancia hospitalaria dada de alta exitosamente.')
      setIsDischargeModalOpen(false)
      await loadAllData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al dar de alta la estancia.'
      showToast(msg, 'danger')
    } finally {
      setIsDischarging(false)
    }
  }

  const isActive = isStayActive(stay)
  const isDischarged = !isActive && Boolean(stay?.dischargedAt || stay?.status === 'Dada de alta')

  // Liquidación calculada
  const liquidation = calculateHospitalizationLiquidation(stay, supplies, medicationOrders, procedureOrders)

  // Formato de fechas
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—'
    try {
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  // Render estado de carga
  if (isLoadingStay) {
    return (
      <div className="flex flex-col gap-6 w-full animate-pulse">
        <div className="h-8 bg-bone rounded-xl w-1/3" />
        <div className="h-44 bg-bone rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-bone rounded-2xl" />
          <div className="h-64 bg-bone rounded-2xl" />
        </div>
      </div>
    )
  }

  // Render error de carga
  if (loadError || !stay) {
    return (
      <div className="flex flex-col gap-5 w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-charcoal">Detalle de Hospitalización</h1>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-border-tan text-charcoal hover:bg-bone transition cursor-pointer"
            >
              Volver a la lista
            </button>
          )}
        </div>

        <div className="p-8 bg-danger-soft border border-danger/30 rounded-2xl text-center space-y-3">
          <p className="text-sm font-bold text-danger">{loadError || 'No se encontró la estancia hospitalaria.'}</p>
          <button
            type="button"
            onClick={() => void loadAllData()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs"
          >
            <ReloadIcon className="w-4 h-4" />
            <span>Reintentar carga</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {toastMessage && (
        <PageToast
          message={toastMessage}
          tone={toastType === 'danger' ? 'warning' : 'success'}
        />
      )}

      {/* Top Bar / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
              Hoja de Hospitalización
            </h1>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold ${
                isActive
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {isActive ? 'Estancia Activa' : 'Dada de alta'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-sage mt-1">
            Gestión clínica de evolución, órdenes médicas y liquidación en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border border-border-tan text-charcoal bg-white hover:bg-bone transition cursor-pointer shadow-xs"
            >
              Volver a la lista
            </button>
          )}

          {isActive && canEdit && (
            <button
              type="button"
              onClick={() => setIsDischargeModalOpen(true)}
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-terracotta text-white hover:bg-terracotta-hover transition cursor-pointer shadow-xs"
            >
              Dar de Alta Médica
            </button>
          )}
        </div>
      </div>

      {/* Banner si la estancia está dada de alta */}
      {isDischarged && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <div>
              <p className="text-xs sm:text-sm font-extrabold">Estancia hospitalaria finalizada</p>
              <p className="text-xs text-amber-800">
                Alta registrada el <span className="font-bold">{formatDate(stay.dischargedAt)}</span>. El historial clínico y la liquidación están en modo de consulta (no es posible anexar nuevas órdenes ni consumos).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ficha Resumen de la Estancia y Paciente */}
      <div className="bg-white border border-border-tan rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-sage uppercase tracking-wider">
              Paciente (Mascota)
            </span>
            <p className="text-sm font-extrabold text-brand truncate">
              {stay.petName || 'Mascota sin nombre'}
            </p>
            <p className="text-xs text-charcoal">
              Propietario: <span className="font-semibold">{stay.ownerName || '—'}</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-sage uppercase tracking-wider flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-sage" />
              <span>Fecha de Ingreso</span>
            </span>
            <p className="text-xs sm:text-sm font-bold text-charcoal">
              {formatDate(stay.admittedAt)}
            </p>
            <p className="text-[11px] text-sage">
              Ingresado por: <span className="font-medium text-charcoal">{stay.admittedByName || 'Veterinario'}</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-sage uppercase tracking-wider flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-sage" />
              <span>Fecha de Alta</span>
            </span>
            <p className="text-xs sm:text-sm font-bold text-charcoal">
              {stay.dischargedAt ? formatDate(stay.dischargedAt) : 'En hospitalización'}
            </p>
            <p className="text-[11px] text-sage">
              Estado: <span className="font-semibold text-brand">{stay.status}</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-sage uppercase tracking-wider">
              Total Liquidación
            </span>
            <p className="text-base sm:text-lg font-black text-brand">
              {formatLiquidationCurrency(liquidation.total)}
            </p>
            <p className="text-[10px] text-sage">Acumulado liquidable</p>
          </div>
        </div>

        <div className="pt-3 border-t border-border-tan/70">
          <span className="text-[10px] font-extrabold text-sage uppercase tracking-wider block mb-1">
            Motivo de Hospitalización
          </span>
          <p className="text-xs sm:text-sm text-charcoal bg-bone/40 p-3 rounded-xl border border-border-tan/60 font-medium">
            {stay.motivo || 'No se especificó motivo de ingreso.'}
          </p>
        </div>
      </div>

      {/* Grid Principal: Órdenes y Liquidación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda / Central: Órdenes y Consumos (2 columnas en desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECCIÓN 1: ÓRDENES MÉDICAS */}
          <div className="bg-white border border-border-tan rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-tan bg-bone/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-brand flex items-center gap-2">
                  <StethoscopeIcon className="w-5 h-5 text-brand" />
                  <span>Órdenes Médicas de la Estancia</span>
                </h2>
                <p className="text-xs text-sage">
                  Medicamentos formulados, procedimientos y exámenes diagnósticos.
                </p>
              </div>

              {!isDischarged && canEdit && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderModalType('MEDICAMENTO')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs"
                  >
                    <PillIcon className="w-3.5 h-3.5" />
                    <span>+ Medicamento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderModalType('PROCEDIMIENTO')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage text-white text-xs font-bold hover:bg-sage-dark transition cursor-pointer shadow-xs"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>+ Procedimiento</span>
                  </button>
                </div>
              )}
            </div>

            {/* Filtros de tipo de orden */}
            <div className="px-4 py-2 border-b border-border-tan bg-bone/10 flex items-center gap-2 text-xs">
              <span className="font-bold text-sage mr-1">Filtrar:</span>
              <button
                type="button"
                onClick={() => setOrderFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  orderFilter === 'all'
                    ? 'bg-brand text-white'
                    : 'bg-white text-charcoal hover:bg-bone border border-border-tan'
                }`}
              >
                Todas ({medicationOrders.length + procedureOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('medications')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  orderFilter === 'medications'
                    ? 'bg-brand text-white'
                    : 'bg-white text-charcoal hover:bg-bone border border-border-tan'
                }`}
              >
                Medicamentos ({medicationOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('procedures')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  orderFilter === 'procedures'
                    ? 'bg-brand text-white'
                    : 'bg-white text-charcoal hover:bg-bone border border-border-tan'
                }`}
              >
                Procedimientos ({procedureOrders.length})
              </button>
            </div>

            {/* Lista de Órdenes */}
            <div className="p-4 sm:p-5 space-y-3">
              {isLoadingOrders ? (
                <div className="p-6 text-center text-xs text-sage">Actualizando órdenes médicas…</div>
              ) : (medicationOrders.length === 0 && procedureOrders.length === 0) ? (
                <div className="p-8 text-center border-2 border-dashed border-border-tan rounded-xl space-y-2">
                  <p className="text-xs sm:text-sm font-bold text-sage">
                    Estancia sin órdenes médicas registradas.
                  </p>
                  {!isDischarged && canEdit && (
                    <div className="flex justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setOrderModalType('MEDICAMENTO')}
                        className="text-xs text-brand font-bold hover:underline"
                      >
                        + Anexar medicamento
                      </button>
                      <span className="text-sage">•</span>
                      <button
                        type="button"
                        onClick={() => setOrderModalType('PROCEDIMIENTO')}
                        className="text-xs text-brand font-bold hover:underline"
                      >
                        + Anexar procedimiento
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Órdenes de Medicamentos */}
                  {(orderFilter === 'all' || orderFilter === 'medications') &&
                    medicationOrders.map((ord) => {
                      const isDelivered = isMedicationOrderDelivered(ord)
                      const isCancelled = ord.status.toLowerCase() === 'cancelada'
                      const isPending = !isDelivered && !isCancelled

                      return (
                        <div
                          key={ord.id}
                          className="p-3.5 rounded-xl border border-border-tan bg-white hover:border-brand/40 transition space-y-2.5 shadow-2xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-tan/60 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-sage-soft text-brand">
                                <PillIcon className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="text-xs font-bold text-brand">
                                  Orden de Medicamento
                                </span>
                                <span className="text-[11px] text-sage block">
                                  {formatDate(ord.createdAt)} • Vet: {ord.veterinarianName || 'Responsable'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  isDelivered
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isCancelled
                                    ? 'bg-bone text-sage border border-border-tan'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {ord.status || 'Pendiente'}
                              </span>

                              {isPending && isActive && canEdit && (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => void handleDeliverMedication(ord.id)}
                                    className="px-2.5 py-1 rounded-lg bg-brand text-white text-[11px] font-bold hover:bg-brand-hover transition cursor-pointer"
                                    title="Marcar como entregada para sumar a la liquidación"
                                  >
                                    Entregar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleCancelMedication(ord.id)}
                                    className="px-2 py-1 rounded-lg border border-border-tan text-sage hover:text-danger text-[11px] font-bold transition cursor-pointer"
                                    title="Cancelar orden"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Ítems */}
                          {ord.items && ord.items.length > 0 ? (
                            <div className="space-y-1.5">
                              {ord.items.map((item, idx) => (
                                <div
                                  key={item.id || idx}
                                  className="flex items-center justify-between text-xs bg-bone/30 px-3 py-2 rounded-lg"
                                >
                                  <div>
                                    <span className="font-bold text-charcoal">
                                      {item.medicationName || 'Medicamento'}
                                    </span>
                                    {item.notes && (
                                      <span className="text-[11px] text-sage block">
                                        Indicaciones: {item.notes}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-charcoal block">
                                      {formatLiquidationCurrency(
                                        item.subtotal ?? (item.unitPrice ?? 0) * (item.quantity ?? 1),
                                      )}
                                    </span>
                                    {item.unitPrice !== undefined && item.unitPrice !== null && (
                                      <span className="text-[10px] text-sage">
                                        Unit: {formatLiquidationCurrency(item.unitPrice)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-sage italic">
                              {ord.referredTo ? `Remitido a: ${ord.referredTo} (${ord.referralReason})` : 'Sin ítems especificados.'}
                            </p>
                          )}
                        </div>
                      )
                    })}

                  {/* Órdenes de Procedimientos */}
                  {(orderFilter === 'all' || orderFilter === 'procedures') &&
                    procedureOrders.map((ord) => {
                      const isCompleted = isProcedureOrderCompleted(ord)
                      const isCancelled = ord.status.toLowerCase() === 'cancelada'
                      const isPending = !isCompleted && !isCancelled

                      return (
                        <div
                          key={ord.id}
                          className="p-3.5 rounded-xl border border-border-tan bg-white hover:border-brand/40 transition space-y-2.5 shadow-2xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-tan/60 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-sage-soft text-brand">
                                <StethoscopeIcon className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="text-xs font-bold text-brand">
                                  Orden de Procedimiento / Examen
                                </span>
                                <span className="text-[11px] text-sage block">
                                  {formatDate(ord.createdAt)} • Vet: {ord.veterinarianName || 'Responsable'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isCancelled
                                    ? 'bg-bone text-sage border border-border-tan'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {ord.status || 'Pendiente'}
                              </span>

                              {isPending && isActive && canEdit && (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => void handleCompleteProcedure(ord.id)}
                                    className="px-2.5 py-1 rounded-lg bg-brand text-white text-[11px] font-bold hover:bg-brand-hover transition cursor-pointer"
                                    title="Marcar como completado para sumar a la liquidación"
                                  >
                                    Completar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleCancelProcedure(ord.id)}
                                    className="px-2 py-1 rounded-lg border border-border-tan text-sage hover:text-danger text-[11px] font-bold transition cursor-pointer"
                                    title="Cancelar orden"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Ítems */}
                          {ord.items && ord.items.length > 0 ? (
                            <div className="space-y-1.5">
                              {ord.items.map((item, idx) => (
                                <div
                                  key={item.id || idx}
                                  className="flex items-center justify-between text-xs bg-bone/30 px-3 py-2 rounded-lg"
                                >
                                  <div>
                                    <span className="font-bold text-charcoal">
                                      {item.procedureName || 'Procedimiento'}
                                    </span>
                                    {item.notes && (
                                      <span className="text-[11px] text-sage block">
                                        Especificaciones: {item.notes}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-charcoal block">
                                      {formatLiquidationCurrency(
                                        item.subtotal ?? (item.unitPrice ?? 0) * (item.quantity ?? 1),
                                      )}
                                    </span>
                                    {item.unitPrice !== undefined && item.unitPrice !== null && (
                                      <span className="text-[10px] text-sage">
                                        Unit: {formatLiquidationCurrency(item.unitPrice)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-sage italic">
                              {ord.referredTo ? `Remitido a: ${ord.referredTo} (${ord.referralReason})` : 'Sin ítems especificados.'}
                            </p>
                          )}

                          {/* Resultado si existe */}
                          {ord.resultFileUrl && (
                            <div className="p-2 rounded-lg bg-sage-soft text-brand text-xs font-semibold flex items-center justify-between">
                              <span>Resultado / Archivo adjunto disponible</span>
                              <a
                                href={ord.resultFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline font-bold"
                              >
                                Ver archivo
                              </a>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: INSUMOS CONSUMIDOS */}
          <div className="bg-white border border-border-tan rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-tan bg-bone/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-brand flex items-center gap-2">
                  <PackageIcon className="w-5 h-5 text-brand" />
                  <span>Insumos Consumidos</span>
                </h2>
                <p className="text-xs text-sage">
                  Materiales, jeringas, sueros y descartables aplicados durante la hospitalización.
                </p>
              </div>

              {!isDischarged && canEdit && (
                <button
                  type="button"
                  onClick={() => setIsSupplyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>+ Registrar Consumo</span>
                </button>
              )}
            </div>

            <div className="p-4 sm:p-5">
              {supplies.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-border-tan rounded-xl space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-sage">
                    Estancia sin consumos de insumos registrados.
                  </p>
                  {!isDischarged && canEdit && (
                    <button
                      type="button"
                      onClick={() => setIsSupplyModalOpen(true)}
                      className="text-xs text-brand font-bold hover:underline"
                    >
                      + Registrar primer consumo de insumo
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-bone text-sage font-bold uppercase tracking-wider text-[10px] border-b border-border-tan">
                      <tr>
                        <th className="p-2.5">Insumo</th>
                        <th className="p-2.5">Cantidad</th>
                        <th className="p-2.5">Precio Unit.</th>
                        <th className="p-2.5">Subtotal</th>
                        <th className="p-2.5">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-tan/60 text-charcoal">
                      {supplies.map((s) => (
                        <tr key={s.id} className="hover:bg-bone/40">
                          <td className="p-2.5 font-bold text-brand">
                            {s.supplyName || 'Insumo'}
                            {s.notes && (
                              <span className="block font-normal text-[11px] text-sage">
                                {s.notes}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-semibold">{s.quantity}</td>
                          <td className="p-2.5 text-sage">{formatLiquidationCurrency(s.unitPrice)}</td>
                          <td className="p-2.5 font-bold text-charcoal">
                            {formatLiquidationCurrency(
                              s.subtotal ?? (s.unitPrice || 0) * (s.quantity || 1),
                            )}
                          </td>
                          <td className="p-2.5 text-sage">{formatDate(s.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Liquidación y Notas de Evolución */}
        <div className="space-y-6">
          {/* RESUMEN AGRUPADO DE LIQUIDACIÓN */}
          <div className="bg-white border-2 border-brand/20 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-border-tan pb-3">
              <h3 className="text-base font-extrabold text-brand flex items-center justify-between">
                <span>Liquidación Acumulada</span>
                <span className="text-xs font-bold text-sage bg-bone px-2 py-0.5 rounded-full">
                  {isDischarged ? 'Cerrada' : 'En vivo'}
                </span>
              </h3>
              <p className="text-xs text-sage mt-0.5">
                Valores calculados por concepto clínico.
              </p>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-charcoal font-medium">Hospitalización (Base)</span>
                <span className="font-bold text-charcoal">
                  {formatLiquidationCurrency(liquidation.hospitalizationTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-charcoal font-medium">Insumos consumidos</span>
                <span className="font-bold text-charcoal">
                  {formatLiquidationCurrency(liquidation.insumosTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-charcoal font-medium">Medicamentos entregados</span>
                <span className="font-bold text-charcoal">
                  {formatLiquidationCurrency(liquidation.medicamentosTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-charcoal font-medium">Procedimientos completados</span>
                <span className="font-bold text-charcoal">
                  {formatLiquidationCurrency(liquidation.procedimientosTotal)}
                </span>
              </div>

              <div className="pt-3 border-t-2 border-brand/20 flex items-center justify-between text-base font-black text-brand">
                <span>Total</span>
                <span>{formatLiquidationCurrency(liquidation.total)}</span>
              </div>
            </div>

            <p className="text-[11px] text-sage bg-sage-soft/40 p-2.5 rounded-xl">
              💡 <strong>Regla de liquidación:</strong> Las órdenes pendientes no se suman al total hasta que sean marcadas como entregadas o completadas.
            </p>
          </div>

          {/* NOTAS Y EVOLUCIÓN CLÍNICA */}
          <div className="bg-white border border-border-tan rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b border-border-tan pb-3">
              <h3 className="text-base font-extrabold text-brand">
                Notas y Evolución Clínica
              </h3>
              <p className="text-xs text-sage">
                Evolución de texto libre y entrega de turno.
              </p>
            </div>

            {/* Formulario para agregar nota */}
            {isActive && canEdit && (
              <form onSubmit={handleAddNote} className="space-y-3 bg-bone/30 p-3.5 rounded-xl border border-border-tan">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-sage mb-1">
                    Nueva Nota de Evolución
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Registra la evolución del paciente, signos, cambios observados o respuesta al tratamiento…"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand resize-none"
                  />
                </div>

                {staffList.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-sage mb-1">
                      Entregar turno a (Staff / Colega)
                    </label>
                    <select
                      value={handedToUserId}
                      onChange={(e) => setHandedToUserId(e.target.value)}
                      className="w-full p-2 rounded-xl border border-border-tan bg-white text-xs text-charcoal focus:outline-none focus:border-brand"
                    >
                      <option value="">-- Sin entrega de turno específica --</option>
                      {staffList.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.roleName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNoteText.trim()}
                  className="w-full py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingNote ? 'Guardando nota…' : 'Registrar Nota de Evolución'}
                </button>
              </form>
            )}

            {/* Timeline de notas */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <p className="text-xs text-sage italic text-center py-4">
                  No hay notas de evolución registradas aún.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl border border-border-tan/80 bg-bone/20 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-sage font-medium">
                      <span className="font-bold text-brand flex items-center gap-1">
                        <UserAvatarIcon className="w-3.5 h-3.5" />
                        {note.authorName || 'Personal médico'}
                      </span>
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-charcoal whitespace-pre-wrap leading-relaxed">
                      {note.nota}
                    </p>
                    {note.handedToName && (
                      <div className="text-[10px] font-bold text-sage bg-sage-soft px-2 py-0.5 rounded-md inline-block">
                        🤝 Entregado a: {note.handedToName}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Crear Orden Médica */}
      {orderModalType && (
        <AnexarOrdenMedicaModal
          isOpen={Boolean(orderModalType)}
          orderType={orderModalType}
          clientPetId={stay.clientPetId}
          hospitalizationStayId={stayId}
          appointmentId={stay.appointmentId}
          petName={stay.petName || 'Mascota'}
          isDischarged={isDischarged}
          onClose={() => setOrderModalType(null)}
          onSuccess={() => {
            showToast('Orden médica anexada exitosamente a la estancia.')
            void refreshOrdersAndSupplies()
          }}
        />
      )}

      {/* Modal para Registrar Consumo de Insumo */}
      {isSupplyModalOpen && (
        <RegistrarConsumoInsumoModal
          isOpen={isSupplyModalOpen}
          stayId={stayId}
          petName={stay.petName}
          isDischarged={isDischarged}
          onClose={() => setIsSupplyModalOpen(false)}
          onSuccess={() => {
            showToast('Consumo de insumo registrado correctamente.')
            void refreshOrdersAndSupplies()
          }}
        />
      )}

      {/* Modal Confirmar Alta Médica */}
      {isDischargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="bg-white border border-border-tan rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-terracotta">
              Confirmar Alta Médica
            </h3>
            <p className="text-xs sm:text-sm text-charcoal">
              ¿Estás seguro de registrar el alta médica para la estancia de{' '}
              <span className="font-bold text-brand">{stay.petName || 'la mascota'}</span>?
            </p>
            <p className="text-xs text-sage bg-bone p-3 rounded-xl">
              Al dar de alta, la estancia se cerrará y ya no se podrán anexar nuevas órdenes ni consumos, pero la hoja y liquidación seguirán disponibles para consulta.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDischargeModalOpen(false)}
                disabled={isDischarging}
                className="px-4 py-2 rounded-xl border border-border-tan text-xs font-bold text-charcoal hover:bg-bone transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDischarge}
                disabled={isDischarging}
                className="px-5 py-2 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-terracotta-hover transition cursor-pointer disabled:opacity-60"
              >
                {isDischarging ? 'Dando de alta…' : 'Confirmar Alta Médica'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
