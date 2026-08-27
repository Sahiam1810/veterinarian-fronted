import type { ReactNode } from 'react'
import { PawIcon, UserAvatarIcon } from '@/global/components'
import type { RecepDuenoDetail, RecepDuenoEstado } from '../types'
import { ViewPopup } from './ViewPopup'
import { CloseIcon, PhoneIcon } from './RecepMascotasIcons'
import { MailIcon } from './PerfilIcons'

interface RecepDuenoDetailPanelProps {
  detail: RecepDuenoDetail
  onClose: () => void
}

// Panel derecho: info del dueño + mascotas registradas (solo al seleccionar)
export function RecepDuenoDetailPanel({ detail, onClose }: RecepDuenoDetailPanelProps) {
  return (
    <ViewPopup
      animationKey={detail.id}
      className="w-full lg:w-[340px] xl:w-[360px] shrink-0 min-w-0"
    >
      <aside className="h-full min-h-0 overflow-y-auto overflow-x-hidden rounded-2xl border border-border-tan bg-white shadow-[0_2px_16px_rgba(35,78,70,0.04)] p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-cream text-brand border border-border-tan flex items-center justify-center shrink-0 text-sm font-extrabold">
            {getInitials(detail.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-brand tracking-tight truncate">
                  {detail.fullName}
                </h2>
                <p className="text-xs text-sage font-medium mt-0.5">ID: {detail.code}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <EstadoPill estado={detail.estado} />
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center"
                  aria-label="Cerrar detalle"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-bone/80 border border-border-tan/70 p-3 flex flex-col gap-2.5">
          <InfoRow icon={<UserAvatarIcon className="w-3.5 h-3.5" />} label="Documento" value={detail.documentId} />
          <InfoRow icon={<PhoneIcon className="w-3.5 h-3.5" />} label="Teléfono" value={detail.phone} />
          <InfoRow icon={<MailIcon className="w-3.5 h-3.5" />} label="Correo" value={detail.email} />
          {detail.address && (
            <InfoRow
              icon={<UserAvatarIcon className="w-3.5 h-3.5" />}
              label="Dirección"
              value={`${detail.address}${detail.city ? ` · ${detail.city}` : ''}`}
            />
          )}
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sage">
              <PawIcon className="w-3.5 h-3.5" />
              <span>Mascotas registradas</span>
            </div>
            <span className="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-full bg-sage-soft text-brand text-xs font-extrabold">
              {detail.petsCount}
            </span>
          </div>

          {detail.pets.length === 0 ? (
            <p className="text-xs text-sage font-medium rounded-xl border border-dashed border-border-tan bg-bone/50 px-3 py-4 text-center">
              Este dueño no tiene mascotas registradas.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {detail.pets.map((pet) => (
                <li
                  key={pet.id}
                  className="rounded-xl border border-border-tan bg-white px-3 py-2.5 flex items-center gap-2.5 min-w-0"
                >
                  <span className="w-9 h-9 rounded-full bg-cream text-sage border border-border-tan inline-flex items-center justify-center shrink-0">
                    <PawIcon className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-charcoal truncate">{pet.name}</p>
                    <p className="text-[11px] text-sage font-medium truncate">
                      {pet.species} · {pet.breed}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {detail.registrationDateLabel && (
          <p className="mt-auto text-[11px] text-sage font-medium text-center">
            Alta: {detail.registrationDateLabel}
          </p>
        )}
      </aside>
    </ViewPopup>
  )
}

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'DU'
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="w-7 h-7 rounded-lg bg-sage-soft text-brand inline-flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-sage">{label}</p>
        <p className="text-xs sm:text-sm font-bold text-charcoal truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}

function EstadoPill({ estado }: { estado: RecepDuenoEstado }) {
  const styles =
    estado === 'Activo'
      ? 'bg-sage-soft text-brand'
      : 'bg-bone text-sage border border-border-tan'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${styles}`}>
      {estado}
    </span>
  )
}
