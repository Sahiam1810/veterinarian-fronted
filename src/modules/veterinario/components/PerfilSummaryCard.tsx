import { UserAvatarIcon } from '@/global/components'
import type { VetProfilePayload } from '../types'
import { CameraIcon, PencilIcon, RefreshIcon } from './PerfilIcons'

interface PerfilSummaryCardProps {
  profile: VetProfilePayload
  onEditProfile?: () => void
  onChangePassword?: () => void
  onChangePhoto?: () => void
}

// Tarjeta izquierda: misma altura que el bloque derecho (items-stretch)
export function PerfilSummaryCard({
  profile,
  onEditProfile,
  onChangePassword,
  onChangePhoto,
}: PerfilSummaryCardProps) {
  const isActive = profile.accountStatus === 'activa'

  return (
    <aside className="w-full h-full rounded-2xl border border-border-tan bg-white p-4 flex flex-col items-center text-center shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
      <div className="relative mb-3">
        {profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt={profile.displayName}
            className="w-24 h-24 rounded-xl object-cover border border-border-tan"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-cream text-sage border border-border-tan flex items-center justify-center">
            <UserAvatarIcon className="w-11 h-11" />
          </div>
        )}
        <button
          type="button"
          onClick={onChangePhoto}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand text-white border-2 border-white shadow-md inline-flex items-center justify-center hover:bg-brand-hover transition cursor-pointer"
          aria-label="Cambiar foto de perfil"
          title="Cambiar foto"
        >
          <CameraIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <h2 className="text-base font-extrabold text-brand tracking-tight leading-tight px-1">
        {profile.displayName}
      </h2>
      <p className="text-xs text-sage font-medium mt-0.5">{profile.jobTitle}</p>

      <span
        className={`mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
          isActive ? 'bg-sage-soft text-brand' : 'bg-terracotta-soft text-terracotta'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-brand' : 'bg-terracotta'}`}
          aria-hidden="true"
        />
        {isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'}
      </span>

      <div className="w-full mt-auto pt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onEditProfile}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-3 py-2 text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer"
        >
          <PencilIcon className="w-3.5 h-3.5" />
          <span>Editar Perfil</span>
        </button>
        <button
          type="button"
          onClick={onChangePassword}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-brand/30 bg-white text-brand px-3 py-2 text-xs sm:text-sm font-bold hover:bg-sage-soft/60 transition cursor-pointer"
        >
          <RefreshIcon className="w-3.5 h-3.5" />
          <span>Cambiar Contraseña</span>
        </button>
      </div>
    </aside>
  )
}
