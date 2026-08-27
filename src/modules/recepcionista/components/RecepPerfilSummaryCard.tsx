import type { ReactNode } from 'react'
import { UserAvatarIcon } from '@/global/components'
import type { RecepProfilePayload } from '../types'
import { BadgeIcon, CameraIcon, MailIcon, PhoneIcon } from './PerfilIcons'

interface RecepPerfilSummaryCardProps {
  profile: RecepProfilePayload
  onChangePhoto?: () => void
}

// Tarjeta izquierda del perfil (foto, estado y datos de contacto)
export function RecepPerfilSummaryCard({
  profile,
  onChangePhoto,
}: RecepPerfilSummaryCardProps) {
  const isActive = profile.accountStatus === 'activa'

  return (
    <aside className="w-full h-full rounded-2xl border border-border-tan bg-white p-5 flex flex-col shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.displayName}
              className="w-24 h-24 rounded-full object-cover border border-border-tan"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-cream text-sage border border-border-tan flex items-center justify-center">
              <UserAvatarIcon className="w-11 h-11" />
            </div>
          )}
          <button
            type="button"
            onClick={onChangePhoto}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-brand border border-border-tan shadow-md inline-flex items-center justify-center hover:bg-bone transition cursor-pointer"
            aria-label="Cambiar foto de perfil"
            title="Cambiar foto"
          >
            <CameraIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <h2 className="text-lg font-extrabold text-charcoal tracking-tight leading-tight px-1">
          {profile.displayName}
        </h2>
        <p className="text-sm text-sage font-medium mt-0.5">{profile.jobTitle}</p>

        <span
          className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
            isActive ? 'bg-sage-soft text-brand' : 'bg-terracotta-soft text-terracotta'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-brand' : 'bg-terracotta'}`}
            aria-hidden
          />
          {isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'}
        </span>
      </div>

      <div className="mt-5 pt-4 border-t border-border-tan flex flex-col gap-4">
        <ContactRow
          icon={<MailIcon className="w-4 h-4" />}
          label="Correo electrónico"
          value={profile.email}
        />
        <ContactRow
          icon={<PhoneIcon className="w-4 h-4" />}
          label="Teléfono"
          value={profile.phone}
        />
        <ContactRow
          icon={<BadgeIcon className="w-4 h-4" />}
          label="ID Empleado"
          value={profile.employeeId}
        />
      </div>
    </aside>
  )
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <span className="mt-0.5 text-sage shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-sage">{label}</p>
        <p className="text-sm font-semibold text-charcoal truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}
