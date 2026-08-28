import { CalendarIcon, PlusIcon } from '@/global/components'
import type { ClienteCitaListItem, ClienteCitaTab } from '../types'
import { canClienteModifyAppointment } from '../utils/appointmentRules'
import { ClienteCallClinicButton } from './ClienteCallClinicButton'

interface ClienteCitasViewProps {
  items: ClienteCitaListItem[]
  activeTab: ClienteCitaTab
  onTabChange: (tab: ClienteCitaTab) => void
  onNewAppointment?: () => void
  onRescheduleAppointment?: (appointmentId: string) => void
  onCancelAppointment?: (appointmentId: string) => void
}

const TABS: { id: ClienteCitaTab; label: string }[] = [
  { id: 'proximas', label: 'Próximas Citas' },
  { id: 'anteriores', label: 'Citas Anteriores' },
]

export function ClienteCitasView({
  items,
  activeTab,
  onTabChange,
  onNewAppointment,
  onRescheduleAppointment,
  onCancelAppointment,
}: ClienteCitasViewProps) {
  const showActions = activeTab === 'proximas'

  return (
    <section className="h-full min-h-0 flex flex-col gap-5 sm:gap-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 shrink-0">
        <header className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight leading-tight">
            Mis Citas
          </h1>
          <p className="mt-1 text-sm sm:text-base text-sage font-medium">
            Gestiona tus consultas y chequeos programados.
          </p>
        </header>

        <button
          type="button"
          onClick={onNewAppointment}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-terracotta hover:bg-terracotta/90 text-white px-4 sm:px-5 py-2.5 text-sm font-bold shadow-sm transition cursor-pointer shrink-0 self-start"
        >
          <PlusIcon className="w-4 h-4" />
          Nueva Cita
        </button>
      </div>

      <div className="border-b border-border-tan shrink-0">
        <div className="flex items-center gap-6 sm:gap-8">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`pb-3 text-sm sm:text-base font-bold transition cursor-pointer border-b-2 -mb-px ${
                  isActive
                    ? 'text-brand border-brand'
                    : 'text-sage border-transparent hover:text-charcoal'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-0.5">
        {activeTab === 'anteriores' && items.length > 0 && (
          <div className="mb-4 rounded-2xl border border-border-tan bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-sage font-medium">
              Las citas ya realizadas no se modifican en línea. Comunícate con recepción.
            </p>
            <ClienteCallClinicButton variant="outline" className="shrink-0 self-start sm:self-auto" />
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border-tan p-8 text-center">
            <p className="text-sm text-sage font-medium">
              {activeTab === 'proximas'
                ? 'No tienes citas próximas programadas.'
                : 'Aún no hay citas anteriores registradas.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 pb-1">
            {items.map((item) => (
              <ClienteCitaCard
                key={item.id}
                item={item}
                showActions={showActions}
                onReschedule={onRescheduleAppointment}
                onCancel={onCancelAppointment}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ClienteCitaCard({
  item,
  showActions,
  onReschedule,
  onCancel,
}: {
  item: ClienteCitaListItem
  showActions: boolean
  onReschedule?: (appointmentId: string) => void
  onCancel?: (appointmentId: string) => void
}) {
  const badgeClass =
    item.status === 'ATENDIDO'
      ? 'bg-border-tan text-sage'
      : item.status === 'CANCELADO'
        ? 'bg-terracotta-soft text-terracotta'
        : 'bg-emerald-50 text-emerald-700'

  return (
    <article className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(35,78,70,0.06)] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-sage">{item.dateLabel}</p>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${badgeClass}`}
        >
          <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
          {item.statusLabel}
        </span>
      </div>

      <p className="text-3xl sm:text-4xl font-extrabold text-brand leading-none tracking-tight">
        {item.timeLabel}
      </p>

      <div className="border-t border-border-tan/60" />

      <div className="flex items-center gap-3 min-w-0">
        <PetAvatar name={item.petName} photoUrl={item.petPhotoUrl} />
        <div className="min-w-0">
          <p className="text-base font-bold text-charcoal truncate">{item.petName}</p>
          <p className="text-sm text-sage truncate">{item.petSpeciesBreed}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-bone/80 border border-border-tan/50 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-sage">
            Servicio
          </p>
          <p className="mt-1 text-sm font-semibold text-charcoal">{item.service}</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-sage">
            Profesional
          </p>
          <p className="mt-1 text-sm font-semibold text-charcoal">{item.professionalName}</p>
        </div>
      </div>

      {showActions && canClienteModifyAppointment(item.status) && (
        <div className="flex items-center gap-4 pt-1">
          <button
            type="button"
            onClick={() => onReschedule?.(item.id)}
            className="inline-flex items-center justify-center rounded-xl border border-charcoal/20 bg-white px-4 py-2.5 text-sm font-bold text-charcoal hover:bg-bone transition cursor-pointer"
          >
            Reprogramar
          </button>
          <button
            type="button"
            onClick={() => onCancel?.(item.id)}
            className="text-sm font-bold text-red-600 hover:text-red-700 transition cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      )}
    </article>
  )
}

function PetAvatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-11 h-11 rounded-full object-cover border border-border-tan shrink-0"
      />
    )
  }

  return (
    <span className="w-11 h-11 rounded-full bg-bone border border-border-tan flex items-center justify-center text-brand font-bold shrink-0">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
