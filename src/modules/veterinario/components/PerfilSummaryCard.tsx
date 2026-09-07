import type { VetProfilePayload } from '../types'
import { CameraIcon, KeyIcon } from './PerfilIcons'

interface PerfilSummaryCardProps {
  profile: VetProfilePayload
  onChangePhoto?: () => void
  onChangePassword?: () => void
}

// Tarjeta izquierda: avatar/foto local + estado de cuenta + cambio de contraseña.
export function PerfilSummaryCard({
  profile,
  onChangePhoto,
  onChangePassword,
}: PerfilSummaryCardProps) {
  const isActive = profile.accountStatus === 'activa'

  return (
    <aside className="w-full h-full rounded-2xl border border-border-tan bg-white p-5 flex flex-col items-center text-center shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
      <div className="relative mb-3">
        {profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt={profile.displayName}
            className="w-24 h-24 rounded-2xl object-cover border border-border-tan shadow-xs"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-2xl bg-brand/12 text-brand border border-brand/20 flex items-center justify-center font-extrabold text-2xl"
            aria-hidden="true"
          >
            {profile.initials}
          </div>
        )}
        <button
          type="button"
          onClick={onChangePhoto}
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-brand border border-border-tan shadow-md inline-flex items-center justify-center hover:bg-bone transition cursor-pointer"
          aria-label="Cambiar foto de perfil"
          title="Cambiar foto (Almacenada únicamente en este navegador)"
        >
          <CameraIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {profile.photoUrl && (
        <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded mb-2">
          Foto local (Este navegador)
        </span>
      )}

      <h2 className="text-base font-extrabold text-brand tracking-tight leading-tight px-1">
        {profile.displayName}
      </h2>
      <p className="text-xs text-sage font-medium mt-0.5">{profile.jobTitle}</p>
      <p className="text-[11px] text-sage/90 font-medium mt-1 truncate max-w-full px-1">
        @{profile.userName}
      </p>

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

      {onChangePassword && (
        <button
          type="button"
          onClick={onChangePassword}
          className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-brand/35 bg-white text-brand py-2.5 text-xs sm:text-sm font-bold hover:bg-sage-soft/50 transition cursor-pointer shadow-2xs active:translate-y-0.5"
        >
          <KeyIcon className="w-3.5 h-3.5" />
          <span>Cambiar Contraseña</span>
        </button>
      )}

      <p className="w-full mt-auto pt-4 text-[10px] leading-snug text-sage font-medium">
        Datos de rol y colegiatura persistidos en el servidor. La foto se almacena localmente en este navegador.
      </p>
    </aside>
  )
}
