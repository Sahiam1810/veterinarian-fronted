import { useState, useEffect, useCallback } from 'react'
import {
  fetchMedications,
  fetchProcedures,
  createMedicationOrder,
  createProcedureOrder,
  type ApiMedication,
  type ApiProcedure,
} from '../services/ordenesMedicasService'
import { CloseIcon, MedicalFolderIcon } from './MascotasIcons'
import { ViewPopup } from './ViewPopup'
import { ProfessionalCombobox } from '@/modules/superadmin/components/ProfessionalCombobox'
import { PawIcon, PlusIcon, TrashIcon, PillIcon } from '@/global/components'

export type MedicalOrderType = 'MEDICAMENTO' | 'PROCEDIMIENTO'

interface SelectedItemInput {
  catalogId: string
  notes: string
}

interface AnexarOrdenMedicaModalProps {
  isOpen: boolean
  orderType: MedicalOrderType
  clientPetId: string
  appointmentId?: string | null
  hospitalizationStayId?: string | null
  petName: string
  onClose: () => void
  onSuccess: () => void
}

export function AnexarOrdenMedicaModal({
  isOpen,
  orderType,
  clientPetId,
  appointmentId,
  hospitalizationStayId,
  petName,
  onClose,
  onSuccess,
}: AnexarOrdenMedicaModalProps) {
  const [isInHouse, setIsInHouse] = useState(true)
  const [referredTo, setReferredTo] = useState('')
  const [referralReason, setReferralReason] = useState('')

  // Catálogo disponible
  const [medicationsCatalog, setMedicationsCatalog] = useState<ApiMedication[]>([])
  const [proceduresCatalog, setProceduresCatalog] = useState<ApiProcedure[]>([])
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  // Ítems seleccionados para orden interna
  const [items, setItems] = useState<SelectedItemInput[]>([{ catalogId: '', notes: '' }])

  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isMedication = orderType === 'MEDICAMENTO'
  const title = isMedication ? 'Anexar Orden de Medicamento' : 'Anexar Orden de Procedimiento'

  const loadCatalog = useCallback(async () => {
    setIsLoadingCatalog(true)
    setCatalogError(null)
    try {
      if (isMedication) {
        const list = await fetchMedications(true)
        setMedicationsCatalog(list)
      } else {
        const list = await fetchProcedures(true)
        setProceduresCatalog(list)
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : `No se pudo cargar el catálogo de ${isMedication ? 'medicamentos' : 'procedimientos'}.`
      setCatalogError(msg)
    } finally {
      setIsLoadingCatalog(false)
    }
  }, [isMedication])

  useEffect(() => {
    if (!isOpen) return
    setFormError(null)
    setCatalogError(null)
    void loadCatalog()
  }, [isOpen, orderType, loadCatalog])

  if (!isOpen) return null

  const handleAddItem = () => {
    setItems((prev) => [...prev, { catalogId: '', notes: '' }])
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: 'catalogId' | 'notes', value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFormError(null)

    if (!clientPetId || (!appointmentId && !hospitalizationStayId)) {
      setFormError('Faltan datos obligatorios del contexto de la atención.')
      return
    }

    if (isInHouse) {
      const validItems = items.filter((i) => Boolean(i.catalogId.trim()))
      if (validItems.length === 0) {
        setFormError(
          `Debes seleccionar al menos un ${isMedication ? 'medicamento' : 'procedimiento'} para una orden interna.`,
        )
        return
      }

      setIsSubmitting(true)
      try {
        if (isMedication) {
          await createMedicationOrder({
            clientPetId,
            appointmentId: appointmentId || null,
            hospitalizationStayId: hospitalizationStayId || null,
            isInHouse: true,
            referredTo: null,
            referralReason: null,
            items: validItems.map((i) => ({
              medicationId: i.catalogId,
              notes: i.notes.trim() || null,
            })),
          })
        } else {
          await createProcedureOrder({
            clientPetId,
            appointmentId: appointmentId || null,
            hospitalizationStayId: hospitalizationStayId || null,
            isInHouse: true,
            referredTo: null,
            referralReason: null,
            items: validItems.map((i) => ({
              procedureId: i.catalogId,
              notes: i.notes.trim() || null,
            })),
          })
        }

        onSuccess()
        onClose()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'No se pudo crear la orden médica.'
        setFormError(msg)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Orden Remitida / Externa
      if (!referredTo.trim()) {
        setFormError('Indica el lugar o centro médico de remisión.')
        return
      }

      if (!referralReason.trim()) {
        setFormError('Indica el motivo de la remisión.')
        return
      }

      setIsSubmitting(true)
      try {
        if (isMedication) {
          await createMedicationOrder({
            clientPetId,
            appointmentId: appointmentId || null,
            hospitalizationStayId: hospitalizationStayId || null,
            isInHouse: false,
            referredTo: referredTo.trim(),
            referralReason: referralReason.trim(),
            items: null,
          })
        } else {
          await createProcedureOrder({
            clientPetId,
            appointmentId: appointmentId || null,
            hospitalizationStayId: hospitalizationStayId || null,
            isInHouse: false,
            referredTo: referredTo.trim(),
            referralReason: referralReason.trim(),
            items: null,
          })
        }

        onSuccess()
        onClose()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'No se pudo crear la orden médica remitida.'
        setFormError(msg)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/45 backdrop-blur-xs cursor-pointer border-0"
        aria-label="Cerrar modal"
        onClick={onClose}
      />

      <ViewPopup
        animationKey="anexar-orden-medica-modal"
        className="relative z-10 w-full max-w-2xl max-h-[min(94dvh,800px)] min-h-0 flex flex-col"
      >
        <div className="bg-bone border border-border-tan rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[min(94dvh,800px)]">
          {/* Header */}
          <header className="shrink-0 flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-border-tan bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-sage-soft text-brand flex items-center justify-center shrink-0">
                {isMedication ? (
                  <PillIcon className="w-5 h-5 text-brand" />
                ) : (
                  <MedicalFolderIcon className="w-5 h-5 text-brand" />
                )}
              </span>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-extrabold text-brand tracking-tight truncate">
                  {title}
                </h2>
                <p className="text-xs text-sage font-medium truncate">
                  Paciente: <span className="font-bold text-charcoal">{petName}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center bg-white shrink-0"
              aria-label="Cerrar"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs sm:text-sm font-medium leading-snug"
                >
                  {formError}
                </div>
              )}

              {/* Selector Interna vs Remitida */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-sage mb-1.5">
                  Tipo de Atención de la Orden *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInHouse(true)}
                    className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border text-center transition cursor-pointer ${
                      isInHouse
                        ? 'bg-brand text-white border-brand shadow-xs'
                        : 'bg-white text-charcoal border-border-tan hover:bg-bone'
                    }`}
                  >
                    Atención Interna
                    <span className="block text-[10px] font-normal opacity-85 mt-0.5">
                      Ítems del catálogo de la clínica
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInHouse(false)}
                    className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border text-center transition cursor-pointer ${
                      !isInHouse
                        ? 'bg-brand text-white border-brand shadow-xs'
                        : 'bg-white text-charcoal border-border-tan hover:bg-bone'
                    }`}
                  >
                    Remisión Externa
                    <span className="block text-[10px] font-normal opacity-85 mt-0.5">
                      Remitir a centro u otro laboratorio
                    </span>
                  </button>
                </div>
              </div>

              {/* Formulario Interno (Ítems del catálogo) */}
              {isInHouse ? (
                <div className="space-y-3 pt-2">
                  {catalogError && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs sm:text-sm font-medium flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold shrink-0">Error de catálogo:</span>
                        <span className="truncate">{catalogError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void loadCatalog()}
                        disabled={isLoadingCatalog}
                        className="px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {isLoadingCatalog ? 'Reintentando…' : 'Reintentar'}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-sage">
                      {isMedication ? 'Medicamentos Formulados' : 'Procedimientos Solicitados'} *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      disabled={isLoadingCatalog}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline cursor-pointer disabled:opacity-50"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>Agregar ítem</span>
                    </button>
                  </div>

                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-white border border-border-tan space-y-2.5 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-sage">
                          Ítem #{index + 1}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-sage hover:text-danger p-1 transition cursor-pointer"
                            title="Eliminar ítem"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <ProfessionalCombobox
                        value={item.catalogId}
                        onChange={(value) => handleItemChange(index, 'catalogId', value)}
                        options={(isMedication ? medicationsCatalog : proceduresCatalog).map((entry) => ({
                          id: entry.id,
                          name: entry.name,
                          subtitle: entry.code || undefined,
                        }))}
                        hasAllOption={false}
                        disabled={isLoadingCatalog}
                        placeholder={
                          isLoadingCatalog
                            ? 'Cargando catálogo…'
                            : `Selecciona un ${isMedication ? 'medicamento' : 'procedimiento'}…`
                        }
                        searchPlaceholder={`Buscar ${isMedication ? 'medicamento' : 'procedimiento'} por nombre o código…`}
                        className="w-full bg-white"
                      />

                      <input
                        type="text"
                        placeholder={
                          isMedication
                            ? 'Dosis e indicaciones (Ej. 1 tableta cada 12 horas por 7 días con alimento)'
                            : 'Notas o especificaciones (Ej. Con ayuno previo de 8 horas)'
                        }
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        className="w-full rounded-lg border border-border-tan bg-white px-3 py-1.5 text-xs text-charcoal placeholder:text-text-placeholder focus:outline-none focus:border-brand"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* Formulario Remisión Externa */
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-sage mb-1">
                      Lugar o Centro Médico de Remisión *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Centro de Diagnóstico Veterinario del Norte / Laboratorio Especializado"
                      value={referredTo}
                      onChange={(e) => setReferredTo(e.target.value)}
                      className="w-full rounded-xl border border-border-tan bg-white px-3 py-2.5 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-sage mb-1">
                      Motivo de Remisión *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe la razón médica por la cual se remite la orden fuera de la clínica…"
                      value={referralReason}
                      onChange={(e) => setReferralReason(e.target.value)}
                      className="w-full rounded-xl border border-border-tan bg-white p-3 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-brand resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="shrink-0 flex items-center justify-end gap-2.5 p-3 sm:p-4 border-t border-border-tan bg-white">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal text-xs sm:text-sm font-bold hover:bg-bone transition cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Guardando orden…</span>
                ) : (
                  <>
                    <PawIcon className="w-4 h-4" />
                    <span>Expedir Orden Médica</span>
                  </>
                )}
              </button>
            </footer>
          </form>
        </div>
      </ViewPopup>
    </div>
  )
}
