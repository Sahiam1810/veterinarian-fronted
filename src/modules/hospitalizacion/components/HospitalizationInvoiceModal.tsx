import { useState } from 'react'
import type { HospitalizationInvoice } from '../types/hospitalizacion.types'
import {
  formatInvoiceCurrency,
  formatInvoiceDate,
  getInvoicePaymentStatus,
  getInvoiceStayStatusBadge,
} from '../utils/hospitalizacionInvoiceUtils'
import { PrinterIcon } from '../../../global/components/Icons.tsx'

export interface HospitalizationInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: HospitalizationInvoice | null
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function HospitalizationInvoiceModal({
  open,
  onOpenChange,
  invoice,
  isLoading = false,
  error = null,
  onRetry,
}: HospitalizationInvoiceModalProps) {
  if (!open) return null

  const [isPreparingPrint, setIsPreparingPrint] = useState(false)

  const handlePrint = () => {
    setIsPreparingPrint(true)
    setTimeout(() => {
      try {
        window.print()
      } finally {
        setIsPreparingPrint(false)
      }
    }, 50)
  }

  const paymentStatus = invoice
    ? getInvoicePaymentStatus(invoice.isPaid, invoice.paidAt)
    : null
  const stayStatus = invoice
    ? getInvoiceStayStatusBadge(invoice.status)
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm print:bg-white print:p-0 print:backdrop-blur-none print:static print:inset-auto animate-view-popup"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hospitalization-invoice-title"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:max-w-none print:border-none print:m-0 print:rounded-none print:p-0 flex flex-col max-h-[90vh] print:max-h-none print:overflow-visible">
        {/* Header - Screen only */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-tan print:hidden bg-[#FAF8F5]">
          <div>
            <h2
              id="hospitalization-invoice-title"
              className="text-lg font-bold text-charcoal tracking-tight"
            >
              Liquidación de Hospitalización
            </h2>
            <p className="text-xs text-sage mt-0.5">
              Detalle de conceptos facturados, consumos y órdenes completadas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-sage hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:overflow-visible print:p-6 text-charcoal">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-brand/30 border-t-brand rounded-full animate-spin" />
              <p className="text-sm text-sage font-medium">Cargando liquidación de la estancia...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="p-3 bg-terracotta-soft/40 border border-terracotta/30 text-terracotta rounded-xl text-sm font-medium">
                {error}
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-semibold hover:bg-brand-hover transition shadow-xs"
                >
                  Reintentar consulta
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && invoice && (
            <>
              {/* Encabezado de la clínica */}
              <div className="text-center pb-4 border-b border-border-tan">
                <h3 className="font-extrabold text-2xl text-brand tracking-tight">
                  Huellitas Veterinarian
                </h3>
                <p className="text-sm font-semibold text-sage mt-0.5 uppercase tracking-wider">
                  Liquidación de Hospitalización
                </p>
                <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-mono bg-bone text-charcoal rounded-md border border-border-tan">
                  Estadía #{invoice.stayId.slice(0, 8)}
                </span>
              </div>

              {/* Información de la Estancia y Paciente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4.5 bg-[#FAF8F5] rounded-xl border border-border-tan text-xs print:bg-white print:border-gray-200">
                <div className="space-y-2">
                  <div>
                    <span className="font-bold text-sage block">Paciente / Mascota:</span>
                    <span className="font-semibold text-charcoal text-sm">
                      {invoice.petName || 'Paciente sin nombre'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-sage block">Propietario:</span>
                    <span className="font-medium text-charcoal">
                      {invoice.ownerName || 'Sin propietario registrado'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-sage block">Estado de la estancia:</span>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded-md font-semibold text-[11px] border ${
                        stayStatus?.badgeClass || 'bg-bone text-sage border-warm-grey'
                      }`}
                    >
                      {stayStatus?.label || invoice.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 sm:text-right">
                  <div>
                    <span className="font-bold text-sage block">Fecha de ingreso:</span>
                    <span className="font-medium text-charcoal">
                      {formatInvoiceDate(invoice.admittedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-sage block">Fecha de alta:</span>
                    <span className="font-medium text-charcoal">
                      {invoice.dischargedAt
                        ? formatInvoiceDate(invoice.dischargedAt)
                        : 'Estancia en curso'}
                    </span>
                  </div>
                  {paymentStatus && (
                    <div>
                      <span className="font-bold text-sage block">Estado de pago:</span>
                      <span
                        className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${paymentStatus.badgeClass}`}
                      >
                        {paymentStatus.label}
                        {paymentStatus.paidAtFormatted
                          ? ` (${paymentStatus.paidAtFormatted})`
                          : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Conceptos Cobrados */}
              <div className="space-y-5 print:space-y-4">
                {/* 1. Concepto Hospitalización */}
                <div className="border border-border-tan rounded-xl overflow-hidden print:border-gray-300 print:break-inside-avoid">
                  <div className="px-4 py-2.5 bg-bone/40 border-b border-border-tan flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      1. Estancia Hospitalaria
                    </span>
                    <span className="text-xs font-bold text-brand font-mono">
                      {formatInvoiceCurrency(invoice.hospitalizationTotal)}
                    </span>
                  </div>
                  <div className="p-3.5 text-xs">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate">
                        Servicio de hospitalización{' '}
                        {invoice.billedDays
                          ? `(${invoice.billedDays} ${
                              invoice.billedDays === 1 ? 'día' : 'días'
                            }${
                              invoice.dailyRate
                                ? ` a ${formatInvoiceCurrency(invoice.dailyRate)}/día`
                                : ''
                            })`
                          : ''}
                      </span>
                      <span className="font-semibold text-charcoal font-mono">
                        {formatInvoiceCurrency(invoice.hospitalizationTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Insumos Consumidos */}
                <div className="border border-border-tan rounded-xl overflow-hidden print:border-gray-300 print:break-inside-avoid">
                  <div className="px-4 py-2.5 bg-bone/40 border-b border-border-tan flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      2. Insumos y Materiales Consumidos
                    </span>
                    <span className="text-xs font-bold text-brand font-mono">
                      {formatInvoiceCurrency(invoice.suppliesTotal)}
                    </span>
                  </div>
                  <div className="p-3.5 text-xs">
                    {invoice.supplies && invoice.supplies.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border-tan/60 text-[11px] font-semibold text-sage">
                            <th className="pb-1.5">Insumo</th>
                            <th className="pb-1.5 text-center">Cant.</th>
                            <th className="pb-1.5 text-right">Precio Unit.</th>
                            <th className="pb-1.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-tan/30">
                          {invoice.supplies.map((item, idx) => (
                            <tr key={`sup-${idx}-${item.name}`}>
                              <td className="py-2 pr-2 font-medium text-charcoal">
                                {item.name}
                                {item.notes && (
                                  <span className="block text-[11px] text-sage font-normal italic">
                                    {item.notes}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-1 text-center text-slate font-medium">
                                {item.quantity}
                              </td>
                              <td className="py-2 px-1 text-right text-slate font-mono">
                                {formatInvoiceCurrency(item.unitPrice)}
                              </td>
                              <td className="py-2 pl-2 text-right font-semibold text-charcoal font-mono">
                                {formatInvoiceCurrency(item.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-sage italic py-1">Sin insumos consumidos registrados.</p>
                    )}
                  </div>
                </div>

                {/* 3. Medicamentos Entregados */}
                <div className="border border-border-tan rounded-xl overflow-hidden print:border-gray-300 print:break-inside-avoid">
                  <div className="px-4 py-2.5 bg-bone/40 border-b border-border-tan flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      3. Medicamentos Entregados
                    </span>
                    <span className="text-xs font-bold text-brand font-mono">
                      {formatInvoiceCurrency(invoice.medicationsTotal)}
                    </span>
                  </div>
                  <div className="p-3.5 text-xs">
                    {invoice.medications && invoice.medications.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border-tan/60 text-[11px] font-semibold text-sage">
                            <th className="pb-1.5">Medicamento</th>
                            <th className="pb-1.5 text-center">Cant.</th>
                            <th className="pb-1.5 text-right">Precio Unit.</th>
                            <th className="pb-1.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-tan/30">
                          {invoice.medications.map((item, idx) => (
                            <tr key={`med-${idx}-${item.name}`}>
                              <td className="py-2 pr-2 font-medium text-charcoal">
                                {item.name}
                                {item.notes && (
                                  <span className="block text-[11px] text-sage font-normal italic">
                                    {item.notes}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-1 text-center text-slate font-medium">
                                {item.quantity}
                              </td>
                              <td className="py-2 px-1 text-right text-slate font-mono">
                                {formatInvoiceCurrency(item.unitPrice)}
                              </td>
                              <td className="py-2 pl-2 text-right font-semibold text-charcoal font-mono">
                                {formatInvoiceCurrency(item.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-sage italic py-1">Sin medicamentos entregados.</p>
                    )}
                  </div>
                </div>

                {/* 4. Procedimientos Completados */}
                <div className="border border-border-tan rounded-xl overflow-hidden print:border-gray-300 print:break-inside-avoid">
                  <div className="px-4 py-2.5 bg-bone/40 border-b border-border-tan flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      4. Procedimientos y Exámenes Completados
                    </span>
                    <span className="text-xs font-bold text-brand font-mono">
                      {formatInvoiceCurrency(invoice.proceduresTotal)}
                    </span>
                  </div>
                  <div className="p-3.5 text-xs">
                    {invoice.procedures && invoice.procedures.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border-tan/60 text-[11px] font-semibold text-sage">
                            <th className="pb-1.5">Procedimiento / Examen</th>
                            <th className="pb-1.5 text-center">Cant.</th>
                            <th className="pb-1.5 text-right">Precio Unit.</th>
                            <th className="pb-1.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-tan/30">
                          {invoice.procedures.map((item, idx) => (
                            <tr key={`proc-${idx}-${item.name}`}>
                              <td className="py-2 pr-2 font-medium text-charcoal">
                                {item.name}
                                {item.notes && (
                                  <span className="block text-[11px] text-sage font-normal italic">
                                    {item.notes}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-1 text-center text-slate font-medium">
                                {item.quantity}
                              </td>
                              <td className="py-2 px-1 text-right text-slate font-mono">
                                {formatInvoiceCurrency(item.unitPrice)}
                              </td>
                              <td className="py-2 pl-2 text-right font-semibold text-charcoal font-mono">
                                {formatInvoiceCurrency(item.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-sage italic py-1">Sin procedimientos completados.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen de Totales */}
              <div className="border-t-2 border-border-tan pt-4 space-y-2 text-xs print:break-inside-avoid">
                <div className="flex justify-between items-center text-slate">
                  <span>Hospitalización:</span>
                  <span className="font-semibold text-charcoal font-mono">
                    {formatInvoiceCurrency(invoice.hospitalizationTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate">
                  <span>Insumos consumidos:</span>
                  <span className="font-semibold text-charcoal font-mono">
                    {formatInvoiceCurrency(invoice.suppliesTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate">
                  <span>Medicamentos entregados:</span>
                  <span className="font-semibold text-charcoal font-mono">
                    {formatInvoiceCurrency(invoice.medicationsTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate">
                  <span>Procedimientos completados:</span>
                  <span className="font-semibold text-charcoal font-mono">
                    {formatInvoiceCurrency(invoice.proceduresTotal)}
                  </span>
                </div>

                <div className="border-t border-border-tan pt-3 flex justify-between items-center text-sm">
                  <span className="font-bold text-charcoal">Total Liquidación:</span>
                  <span className="text-xl font-extrabold text-brand font-mono">
                    {formatInvoiceCurrency(invoice.total)}
                  </span>
                </div>
              </div>
            </>
          )}

          {!isLoading && !error && !invoice && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
              <p className="text-sm font-semibold text-charcoal">
                No hay información de liquidación disponible.
              </p>
              <p className="text-xs text-sage">
                No se encontraron registros de cobro para esta estancia.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions - Screen only */}
        <div className="px-6 py-4 bg-bone/30 border-t border-border-tan flex items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-charcoal hover:bg-bone transition border border-border-tan/80"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={isLoading || !!error || !invoice || isPreparingPrint}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-hover transition flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPreparingPrint ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Preparando...</span>
              </>
            ) : (
              <>
                <PrinterIcon className="w-4 h-4" />
                <span>Imprimir liquidación</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
