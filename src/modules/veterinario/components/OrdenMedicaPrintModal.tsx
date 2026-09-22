import type { ApiMedicationOrder, ApiProcedureOrder } from '../services/ordenesMedicasService'
import { CloseIcon } from './MascotasIcons'
import { ViewPopup } from './ViewPopup'
import { PawIcon, PrinterIcon } from '@/global/components'

export type PrintOrderType = 'MEDICAMENTO' | 'PROCEDIMIENTO'

interface OrdenMedicaPrintModalProps {
  isOpen: boolean
  orderType: PrintOrderType
  medicationOrder?: ApiMedicationOrder | null
  procedureOrder?: ApiProcedureOrder | null
  petName: string
  speciesBreed?: string
  ownerName?: string
  veterinarianName?: string
  onClose: () => void
}

export function OrdenMedicaPrintModal({
  isOpen,
  orderType,
  medicationOrder,
  procedureOrder,
  petName,
  speciesBreed,
  ownerName,
  veterinarianName,
  onClose,
}: OrdenMedicaPrintModalProps) {
  if (!isOpen) return null

  const isMedication = orderType === 'MEDICAMENTO'
  const order = isMedication ? medicationOrder : procedureOrder

  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-charcoal/50 backdrop-blur-xs print:p-0 print:bg-white print:static"
      role="dialog"
      aria-modal="true"
    >
      {/* Botón de cerrar de fondo fuera de impresión */}
      <button
        type="button"
        className="absolute inset-0 border-0 cursor-pointer print:hidden"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <ViewPopup
        animationKey="orden-medica-print-modal"
        className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-border-tan shadow-2xl overflow-hidden flex flex-col print:shadow-none print:border-none print:w-full print:max-w-none"
      >
        {/* Header no imprimible con botones de control */}
        <div className="shrink-0 flex items-center justify-between p-4 bg-bone border-b border-border-tan print:hidden">
          <div className="flex items-center gap-2">
            <PrinterIcon className="w-5 h-5 text-brand" />
            <span className="font-extrabold text-brand text-sm sm:text-base">
              Vista Previa de Orden Imprimible
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Imprimir Orden</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand bg-white cursor-pointer inline-flex items-center justify-center"
              aria-label="Cerrar"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Documento imprimible (Plantilla física de la clínica) */}
        <div className="p-6 sm:p-8 space-y-6 text-charcoal bg-white print:p-4 print:space-y-4">
          {/* Encabezado Clínica */}
          <div className="flex items-start justify-between border-b-2 border-brand pb-4">
            <div>
              <div className="flex items-center gap-2 text-brand font-extrabold text-xl sm:text-2xl tracking-tight">
                <PawIcon className="w-6 h-6" />
                <span>Clínica Veterinaria</span>
              </div>
              <p className="text-xs text-sage font-medium mt-0.5">
                Orden Médica de {isMedication ? 'Medicamentos' : 'Procedimientos y Pruebas'}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-sage-soft text-brand">
                {order.isInHouse ? 'Atención Interna' : 'Remisión Externa'}
              </span>
              <p className="text-[11px] text-sage font-medium mt-1">N° Orden: {order.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Ficha del Paciente y Cita */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-bone/60 border border-border-tan text-xs sm:text-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">Paciente</span>
              <p className="font-extrabold text-brand text-base">{petName}</p>
              {speciesBreed && <p className="text-xs text-sage">{speciesBreed}</p>}
              {ownerName && <p className="text-xs text-charcoal/80 mt-1">Propietario: {ownerName}</p>}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">Detalles de Emisión</span>
              <p className="font-semibold text-charcoal">{formattedDate}</p>
              {veterinarianName && <p className="text-xs text-sage mt-1">Médico Veterinario: <span className="font-bold text-charcoal">{veterinarianName}</span></p>}
              <p className="text-xs text-sage mt-0.5">Estado: <span className="font-bold text-brand">{order.status}</span></p>
            </div>
          </div>

          {/* Cuerpo de la Orden */}
          {order.isInHouse ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sage border-b border-border-tan pb-1">
                {isMedication ? 'Prescripción de Medicamentos' : 'Procedimientos Solicitados'}
              </h4>

              {order.items && order.items.length > 0 ? (
                <div className="space-y-2.5">
                  {order.items.map((item, idx) => (
                    <div key={item.id} className="p-3 rounded-lg border border-border-tan/70 bg-white space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand text-sm">
                          {idx + 1}. {isMedication ? (item as any).medicationName || 'Medicamento' : (item as any).procedureName || 'Procedimiento'}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-charcoal/90 pl-4 border-l-2 border-brand/30 leading-relaxed font-medium">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-sage italic">Sin ítems detallados.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3 p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-amber-200 pb-1">
                Datos de Remisión Médica Externa
              </h4>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">Remitido A</span>
                <p className="font-extrabold text-charcoal text-sm">{order.referredTo}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">Motivo de la Remisión</span>
                <p className="text-xs text-charcoal/90 leading-relaxed">{order.referralReason}</p>
              </div>
            </div>
          )}

          {/* Archivo de resultado si aplica en procedimiento */}
          {!isMedication && (order as ApiProcedureOrder).resultFileUrl && (
            <div className="p-3 rounded-xl bg-sage-soft/60 border border-brand/20 text-xs">
              <span className="font-bold text-brand block">Resultado Adjunto:</span>
              <a
                href={(order as ApiProcedureOrder).resultFileUrl!}
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline font-semibold break-all"
              >
                {(order as ApiProcedureOrder).resultFileUrl}
              </a>
            </div>
          )}

          {/* Firma del Veterinario */}
          <div className="pt-12 flex justify-between items-end text-xs text-sage print:pt-16">
            <div className="text-center w-48 border-t border-charcoal/40 pt-1">
              <p className="font-bold text-charcoal">{veterinarianName || 'Firma Médico Veterinario'}</p>
              <p className="text-[10px]">Firma y Registro Profesional</p>
            </div>

            <div className="text-right text-[10px]">
              Documento expedido por Sistema Veterinario · Impreso el {new Date().toLocaleDateString('es-CO')}
            </div>
          </div>
        </div>
      </ViewPopup>
    </div>
  )
}
