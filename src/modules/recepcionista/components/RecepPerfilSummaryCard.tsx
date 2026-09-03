import type { ReactNode } from 'react'
import type { RecepProfilePayload } from '../types'
import { BadgeIcon, CameraIcon, MailIcon, UserOutlineIcon } from './PerfilIcons'

interface RecepPerfilSummaryCardProps {
  profile: RecepProfilePayload
  onChangePhoto?: () => void
}

// Tarjeta izquierda del perfil (foto/avatar, estado y datos de contacto)
export function RecepPerfilSummaryCard({
  profile,
  onChangePhoto,
}: RecepPerfilSummaryCardProps) {
  const isActive = profile.accountStatus?.toLowerCase().includes('activ') ?? true

  return (
    <aside className="w-full h-full rounded-2xl border border-border-tan bg-white p-5 flex flex-col shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.displayName}
              className="w-24 h-24 rounded-full object-cover border border-border-tan shadow-xs"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand to-emerald-700 text-white font-black text-2xl border-4 border-bone shadow-md flex items-center justify-center">
              {profile.initials}
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
        <p className="text-xs text-charcoal/70 font-semibold mt-0.5">
          @{profile.userName}
        </p>
        <p className="text-xs sm:text-sm text-sage font-semibold mt-1">
          {profile.jobTitle || 'Recepcionista'}
        </p>

        <span
          className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
            isActive ? 'bg-sage-soft text-brand border border-brand/10' : 'bg-terracotta-soft text-terracotta'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-brand animate-pulse' : 'bg-terracotta'}`}
            aria-hidden
          />
          {isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'}
        </span>
      </div>

      <div className="mt-5 pt-4 border-t border-border-tan/60 flex flex-col gap-3.5">
        <ContactRow
          icon={<MailIcon className="w-4 h-4" />}
          label="Correo electrónico"
          value={profile.email}
        />
        <ContactRow
          icon={<UserOutlineIcon className="w-4 h-4" />}
          label="Nombre de usuario"
          value={`@${profile.userName}`}
        />
        <ContactRow
          icon={<BadgeIcon className="w-4 h-4" />}
          label="Rol en el sistema"
          value={profile.role || 'Recepcionista'}
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
        <p className="text-xs sm:text-sm font-semibold text-charcoal truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}
