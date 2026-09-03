import type { VetProfilePayload } from '../types'

interface PerfilSummaryCardProps {
  profile: VetProfilePayload
}

// Tarjeta izquierda: avatar por iniciales (sin foto persistida) + estado de cuenta.
export function PerfilSummaryCard({ profile }: PerfilSummaryCardProps) {
  const isActive = profile.accountStatus === 'activa'

  return (
    <aside className="w-full h-full rounded-2xl border border-border-tan bg-white p-4 flex flex-col items-center text-center shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
      <div
        className="mb-3 w-24 h-24 rounded-xl bg-brand/12 text-brand border border-brand/20 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-2xl font-extrabold tracking-tight">{profile.initials}</span>
      </div>

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

      <p className="w-full mt-auto pt-4 text-[11px] leading-snug text-sage font-medium">
        Perfil en solo lectura. La edición y la foto las administra el sistema.
      </p>
    </aside>
  )
}
