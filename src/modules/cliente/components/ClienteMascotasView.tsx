import type { ReactNode } from 'react'
import { CalendarIcon, PlusIcon } from '@/global/components'
import type { ClienteMascotaDetail } from '../types'
import {
  canClienteModifyAppointment,
} from '../utils/appointmentRules'
import { ClienteCallClinicButton, ClienteCallClinicHint } from './ClienteCallClinicButton'

interface ClienteMascotasViewProps {
  pets: ClienteMascotaDetail[]
  selectedPetId: string | null
  selectedPet: ClienteMascotaDetail | null
  onSelectPet: (petId: string) => void
  onScheduleAppointment?: () => void
  onModifyAppointment?: () => void
  onViewFullHistory?: () => void
  onDownloadCard?: () => void
  onShareProfile?: () => void
}

export function ClienteMascotasView({
  pets,
  selectedPetId,
  selectedPet,
  onSelectPet,
  onScheduleAppointment,
  onModifyAppointment,
  onViewFullHistory,
  onDownloadCard,
  onShareProfile,
}: ClienteMascotasViewProps) {
  if (!selectedPet) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-sage font-medium">No hay mascotas registradas.</p>
      </div>
    )
  }

  return (
    <section className="h-full min-h-0 min-w-0 flex flex-col gap-3 overflow-hidden">
      {pets.length > 1 && (
        <div className="shrink-0 flex items-center gap-2 overflow-x-hidden">
          {pets.map((pet) => {
            const isActive = pet.id === selectedPetId
            return (
              <button
                key={pet.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectPet(pet.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
                  isActive
                    ? 'bg-brand text-white shadow-sm'
                    : 'bg-white border border-border-tan text-sage hover:text-charcoal'
                }`}
              >
                <PetMiniAvatar name={pet.name} photoUrl={pet.photoUrl} isActive={isActive} />
                {pet.name}
              </button>
            )
          })}
        </div>
      )}

      <header className="shrink-0 bg-white rounded-2xl border border-border-tan shadow-sm px-4 py-3 sm:px-5 sm:py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <PetProfileAvatar name={selectedPet.name} photoUrl={selectedPet.photoUrl} />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand truncate">
              {selectedPet.name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <TagPill tone="green">{selectedPet.species}</TagPill>
              <TagPill tone="gray">{selectedPet.breed}</TagPill>
              <TagPill tone="gray">{selectedPet.ageLabel}</TagPill>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onScheduleAppointment}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-terracotta hover:bg-terracotta/90 text-white px-4 py-2.5 text-sm font-bold transition cursor-pointer shrink-0 self-start lg:self-auto"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="truncate">Agendar nueva cita para {selectedPet.name}</span>
        </button>
      </header>

      <div className="flex-1 min-h-0 min-w-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-3 overflow-hidden">
        <div className="min-h-0 min-w-0 flex flex-col gap-2.5 overflow-hidden">
          <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
            <InfoCard label="Peso Actual" value={selectedPet.weightLabel} />
            <InfoCard
              label="Sexo"
              value={
                <span className="inline-flex items-center gap-1.5 text-brand">
                  <MaleIcon className="w-4 h-4 shrink-0" />
                  {selectedPet.sexLabel}
                </span>
              }
            />
          </div>

          <article className="shrink-0 bg-white rounded-2xl border border-border-tan px-4 py-3 flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-sage">
                Última Desparasitación
              </p>
              <p className="mt-1 text-sm sm:text-base font-bold text-charcoal truncate">
                {selectedPet.lastDewormingLabel}
              </p>
            </div>
            <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0">
              {selectedPet.dewormingStatusLabel}
            </span>
          </article>

          <article className="shrink-0 bg-white rounded-2xl border border-border-tan px-4 py-3 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-sage">
              Observaciones
            </p>
            <p className="mt-1.5 text-sm text-charcoal leading-snug line-clamp-2">
              {selectedPet.observations}
            </p>
          </article>

          <article className="flex-1 min-h-0 bg-white rounded-2xl border border-border-tan shadow-sm overflow-hidden flex flex-col min-w-0">
            <div className="shrink-0 px-4 py-3 border-b border-border-tan/70">
              <h2 className="text-base font-bold text-brand">Historial Reciente</h2>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden px-3 sm:px-4 py-2">
              <HistoryTable rows={selectedPet.recentHistory.slice(0, 3)} />
            </div>

            <div className="shrink-0 px-4 py-2.5 border-t border-border-tan/70 text-center">
              <button
                type="button"
                onClick={onViewFullHistory}
                className="text-sm font-bold text-brand hover:text-brand-hover transition cursor-pointer"
              >
                Ver historial completo
              </button>
            </div>
          </article>
        </div>

        <aside className="min-h-0 min-w-0 flex flex-col gap-2.5 overflow-hidden">
          {selectedPet.upcomingAppointment ? (
            <article className="shrink-0 rounded-2xl bg-brand text-white p-4 shadow-sm flex flex-col gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 shrink-0" />
                <h2 className="text-base font-bold">
                  {canClienteModifyAppointment(selectedPet.upcomingAppointment.status)
                    ? 'Próxima Cita'
                    : 'Última Cita'}
                </h2>
              </div>
              <div className="rounded-xl bg-brand-darker/35 border border-white/10 p-3 space-y-2 min-w-0">
                <p className="text-sm font-semibold leading-snug line-clamp-2">
                  {selectedPet.upcomingAppointment.service}
                </p>
                <p className="text-xs sm:text-sm text-white/85">
                  {selectedPet.upcomingAppointment.dateLabel}
                </p>
                <p className="text-xs sm:text-sm text-white/85">
                  {selectedPet.upcomingAppointment.timeLabel}
                </p>
              </div>
              {canClienteModifyAppointment(selectedPet.upcomingAppointment.status) ? (
                <button
                  type="button"
                  onClick={onModifyAppointment}
                  className="w-full rounded-xl bg-white text-brand py-2.5 text-sm font-bold hover:bg-bone transition cursor-pointer"
                >
                  Modificar Cita
                </button>
              ) : (
                <div className="space-y-2">
                  <ClienteCallClinicHint />
                  <ClienteCallClinicButton variant="light" className="w-full" />
                </div>
              )}
            </article>
          ) : (
            <article className="shrink-0 rounded-2xl bg-brand/10 border border-border-tan p-4 text-sm text-sage font-medium">
              Sin cita próxima programada.
            </article>
          )}

          <article className="shrink-0 bg-white rounded-2xl border border-border-tan p-4 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-sage">
              Acciones Rápidas
            </p>
            <div className="mt-3 space-y-2">
              <QuickActionRow
                label="Descargar Cartilla"
                icon={<DocIcon className="w-4 h-4" />}
                onClick={onDownloadCard}
              />
              <QuickActionRow
                label="Compartir Perfil"
                icon={<ShareIcon className="w-4 h-4" />}
                onClick={onShareProfile}
              />
            </div>
          </article>
        </aside>
      </div>
    </section>
  )
}

function InfoCard({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <article className="bg-white rounded-2xl border border-border-tan px-4 py-3 min-w-0">
      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-sage">{label}</p>
      <div className="mt-1 text-lg sm:text-xl font-extrabold text-charcoal truncate">{value}</div>
    </article>
  )
}

function HistoryTable({ rows }: { rows: ClienteMascotaDetail['recentHistory'] }) {
  return (
    <div className="h-full min-h-0 flex flex-col min-w-0">
      <div className="shrink-0 grid grid-cols-4 gap-2 px-1 py-2 rounded-lg bg-brand/10 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-brand">
        <span>Fecha</span>
        <span>Diagnóstico</span>
        <span>Síntomas</span>
        <span>Tratamiento</span>
      </div>
      <div className="flex-1 min-h-0 space-y-1 overflow-hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-4 gap-2 px-1 py-2 border-b border-border-tan/50 last:border-b-0 text-xs sm:text-sm min-w-0"
          >
            <CellText>{row.dateLabel}</CellText>
            <CellText>{row.diagnosis}</CellText>
            <CellText>{row.symptoms}</CellText>
            <CellText>{row.treatment}</CellText>
          </div>
        ))}
      </div>
    </div>
  )
}

function CellText({ children }: { children: ReactNode }) {
  return <span className="text-charcoal truncate block min-w-0">{children}</span>
}

function TagPill({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'green' | 'gray'
}) {
  const toneClass =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
      : 'bg-bone text-sage border-border-tan/70'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${toneClass}`}
    >
      {children}
    </span>
  )
}

function PetProfileAvatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-brand/20 shrink-0"
      />
    )
  }

  return (
    <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-brand/10 border-2 border-brand/20 flex items-center justify-center text-xl font-extrabold text-brand shrink-0">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

function PetMiniAvatar({
  name,
  photoUrl,
  isActive,
}: {
  name: string
  photoUrl: string | null
  isActive: boolean
}) {
  const className = `w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
    isActive ? 'bg-white/20 text-white' : 'bg-bone text-brand'
  }`

  if (photoUrl) {
    return <img src={photoUrl} alt={name} className={`${className} object-cover`} />
  }

  return <span className={className}>{name.charAt(0).toUpperCase()}</span>
}

function QuickActionRow({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 text-sm font-semibold text-charcoal hover:text-brand transition cursor-pointer"
    >
      <span className="w-8 h-8 rounded-lg bg-bone flex items-center justify-center text-brand shrink-0">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function MaleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="10" cy="14" r="5" />
      <path d="M15 9l5-5" />
      <path d="M15 4h5v5" />
    </svg>
  )
}

function DocIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function ShareIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
