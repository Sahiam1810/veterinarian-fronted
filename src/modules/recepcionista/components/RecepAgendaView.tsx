import type { ReactNode } from 'react'
import {
  CalendarIcon,
  PawIcon,
  SearchIcon,
  StethoscopeIcon,
} from '@/global/components'
import type {
  RecepAgendaDayAppointment,
  RecepAgendaFormState,
  RecepAgendaOwnerOption,
  RecepAgendaPetOption,
  RecepAgendaProfessionalOption,
  RecepAgendaServiceOption,
  RecepAgendaTimeSlot,
} from '../types'
import { ViewPopup } from './ViewPopup'
import { RecepDayCalendarPanel } from './RecepDayCalendarPanel'

interface RecepAgendaViewProps {
  form: RecepAgendaFormState
  ownerSuggestions: RecepAgendaOwnerOption[]
  petsForOwner: RecepAgendaPetOption[]
  services: RecepAgendaServiceOption[]
  professionals: RecepAgendaProfessionalOption[]
  timeSlots: RecepAgendaTimeSlot[]
  selectedOwnerName: string | null
  selectedPetLabel: string | null
  selectedServiceLabel: string | null
  selectedProfessionalName: string | null
  summaryWhen: string
  isDayPanelOpen: boolean
  dayAppointments: RecepAgendaDayAppointment[]
  isDayLoading?: boolean
  dayPanelTitle: string
  dayPanelDate: string
  onOwnerQueryChange: (value: string) => void
  onSelectOwnerSuggestion: (owner: RecepAgendaOwnerOption) => void
  onPetChange: (petId: string) => void
  onServiceChange: (serviceId: string) => void
  onProfessionalChange: (professionalId: string) => void
  onDateChange: (value: string) => void
  onTimeSlotChange: (slotId: string) => void
  onNotesChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
  onOpenDayPanel: () => void
  onCloseDayPanel: () => void
  onChangeDayPanelDate: (dateValue: string) => void
  onEditAppointment: (appointment: RecepAgendaDayAppointment) => void
}

const fieldClass =
  'w-full rounded-lg border border-border-tan bg-white px-3 py-2 text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition'
const labelClass = 'block text-[11px] font-bold text-charcoal mb-1'

// Vista Agenda y Citas: formulario + resumen, sin scroll
export function RecepAgendaView({
  form,
  ownerSuggestions,
  petsForOwner,
  services,
  professionals,
  timeSlots,
  selectedOwnerName,
  selectedPetLabel,
  selectedServiceLabel,
  selectedProfessionalName,
  summaryWhen,
  isDayPanelOpen,
  dayAppointments,
  isDayLoading = false,
  dayPanelTitle,
  dayPanelDate,
  onOwnerQueryChange,
  onSelectOwnerSuggestion,
  onPetChange,
  onServiceChange,
  onProfessionalChange,
  onDateChange,
  onTimeSlotChange,
  onNotesChange,
  onConfirm,
  onCancel,
  onOpenDayPanel,
  onCloseDayPanel,
  onChangeDayPanelDate,
  onEditAppointment,
}: RecepAgendaViewProps) {
  const showOwnerSuggestions =
    form.ownerQuery.trim().length > 0 &&
    !form.ownerId &&
    ownerSuggestions.length > 0

  return (
    <>
      <ViewPopup
        animationKey="agenda"
        className="h-full min-h-0 min-w-0 overflow-hidden flex flex-col lg:flex-row gap-3"
      >
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col gap-2.5">
          <FormSection step={1} title="Detalles del Paciente">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
              <div className="min-w-0 relative">
                <label className={labelClass} htmlFor="recep-owner-search">
                  Buscar Dueño (Cliente)
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sage pointer-events-none" />
                  <input
                    id="recep-owner-search"
                    type="search"
                    value={form.ownerQuery}
                    onChange={(event) => onOwnerQueryChange(event.target.value)}
                    placeholder="Ej. Juan Pérez o DNI"
                    className={`${fieldClass} pl-9`}
                    autoComplete="off"
                  />
                </div>
                {showOwnerSuggestions && (
                  <ul className="absolute z-20 mt-1 w-full max-h-28 overflow-y-auto rounded-lg border border-border-tan bg-white shadow-md">
                    {ownerSuggestions.map((owner) => (
                      <li key={owner.id}>
                        <button
                          type="button"
                          onClick={() => onSelectOwnerSuggestion(owner)}
                          className="w-full text-left px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-bone cursor-pointer"
                        >
                          <span className="font-bold">{owner.name}</span>
                          <span className="text-sage"> · {owner.documentLabel}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="min-w-0">
                <label className={labelClass} htmlFor="recep-pet-select">
                  Seleccionar Mascota
                </label>
                <select
                  id="recep-pet-select"
                  value={form.petId}
                  onChange={(event) => onPetChange(event.target.value)}
                  disabled={!form.ownerId}
                  className={`${fieldClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <option value="">Seleccione mascota...</option>
                  {petsForOwner.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.breed})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FormSection>

          <FormSection step={2} title="Servicio y Atención">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
              <div className="min-w-0">
                <label className={labelClass} htmlFor="recep-service-select">
                  Motivo de Consulta
                </label>
                <select
                  id="recep-service-select"
                  value={form.serviceId}
                  onChange={(event) => onServiceChange(event.target.value)}
                  className={fieldClass}
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className={labelClass} htmlFor="recep-pro-select">
                  Profesional Asignado
                </label>
                <select
                  id="recep-pro-select"
                  value={form.professionalId}
                  onChange={(event) => onProfessionalChange(event.target.value)}
                  className={fieldClass}
                >
                  {professionals.map((pro) => (
                    <option key={pro.id} value={pro.id}>
                      {pro.name} ({pro.roleLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FormSection>

          <FormSection step={3} title="Fecha y Horario" className="flex-1 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-[11px] font-bold text-charcoal" htmlFor="recep-date">
                    Fecha de la Cita
                  </label>
                  <button
                    type="button"
                    onClick={onOpenDayPanel}
                    className="inline-flex items-center gap-1 rounded-lg border border-brand/25 bg-sage-soft px-2 py-0.5 text-[10px] font-bold text-brand hover:bg-brand hover:text-white transition cursor-pointer"
                    title="Ver citas registradas del día"
                  >
                    <CalendarIcon className="w-3 h-3" />
                    <span>Ver citas</span>
                  </button>
                </div>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sage pointer-events-none" />
                  <input
                    id="recep-date"
                    type="date"
                    value={form.dateValue}
                    onChange={(event) => onDateChange(event.target.value)}
                    className={`${fieldClass} pl-9`}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <p className={labelClass}>Horarios Disponibles</p>
                <div className="flex flex-wrap gap-1.5">
                  {timeSlots.map((slot) => {
                    const selected = form.timeSlotId === slot.id
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => onTimeSlotChange(slot.id)}
                        className={`
                          min-w-[3.25rem] px-2.5 py-1.5 rounded-lg text-xs font-bold border transition
                          ${
                            !slot.available
                              ? 'border-border-tan/60 text-sage/40 bg-bone cursor-not-allowed'
                              : selected
                                ? 'border-brand bg-sage-soft text-brand'
                                : 'border-border-tan bg-white text-charcoal hover:border-brand/40 cursor-pointer'
                          }
                        `}
                      >
                        {slot.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-2.5 min-w-0">
              <label className={labelClass} htmlFor="recep-notes">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                id="recep-notes"
                value={form.notes}
                onChange={(event) => onNotesChange(event.target.value)}
                placeholder="Observaciones para el veterinario..."
                rows={2}
                className={`${fieldClass} resize-none`}
              />
            </div>
          </FormSection>
        </div>

        <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0 min-h-0 overflow-hidden flex flex-col gap-2.5">
          <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-border-tan bg-white shadow-[0_2px_16px_rgba(35,78,70,0.04)] p-4 flex flex-col gap-3">
            <div className="shrink-0 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-brand tracking-tight">
                  Resumen de Cita
                </h2>
                <p className="text-[11px] text-sage font-medium mt-0.5">
                  Revisa los detalles antes de confirmar.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenDayPanel}
                className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl border border-border-tan bg-bone text-brand hover:bg-sage-soft hover:border-brand/30 transition cursor-pointer"
                aria-label="Ver citas del día"
                title="Ver citas del día"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-3">
              <SummaryRow
                icon={<PawIcon className="w-4 h-4" />}
                label="Paciente"
                title={selectedPetLabel ?? 'Sin mascota'}
                subtitle={
                  selectedOwnerName ? `Dueño: ${selectedOwnerName}` : 'Dueño pendiente'
                }
              />
              <SummaryRow
                icon={<StethoscopeIcon className="w-4 h-4" />}
                label="Servicio"
                title={selectedServiceLabel ?? 'Sin servicio'}
                subtitle={selectedProfessionalName ?? 'Profesional pendiente'}
              />
              <SummaryRow
                icon={<CalendarIcon className="w-4 h-4" />}
                label="Cuándo"
                title={summaryWhen}
              />
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full rounded-xl bg-brand text-white px-4 py-2.5 text-sm font-bold hover:bg-brand-hover transition cursor-pointer"
            >
              Confirmar y Agendar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-xl border border-terracotta/40 text-terracotta bg-white px-4 py-2.5 text-sm font-bold hover:bg-terracotta-soft transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </aside>
      </ViewPopup>

      <RecepDayCalendarPanel
        isOpen={isDayPanelOpen}
        title={dayPanelTitle}
        dateValue={dayPanelDate}
        appointments={dayAppointments}
        isLoading={isDayLoading}
        onClose={onCloseDayPanel}
        onChangeDate={onChangeDayPanelDate}
        onEditAppointment={onEditAppointment}
      />
    </>
  )
}

function FormSection({
  step,
  title,
  children,
  className = '',
}: {
  step: number
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`shrink-0 rounded-2xl border border-border-tan bg-white shadow-[0_2px_16px_rgba(35,78,70,0.04)] px-3.5 py-3 min-w-0 ${className}`}
    >
      <div className="flex items-center gap-2 mb-2.5 min-w-0">
        <span className="w-6 h-6 rounded-full bg-brand text-white text-[11px] font-extrabold inline-flex items-center justify-center shrink-0">
          {step}
        </span>
        <h3 className="text-sm font-extrabold text-brand tracking-tight truncate">
          {title}
        </h3>
      </div>
      {children}
    </section>
  )
}

function SummaryRow({
  icon,
  label,
  title,
  subtitle,
}: {
  icon: ReactNode
  label: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <span className="w-8 h-8 rounded-lg bg-sage-soft text-brand inline-flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-sage">{label}</p>
        <p className="text-sm font-bold text-charcoal truncate" title={title}>
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-sage font-medium truncate" title={subtitle}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
