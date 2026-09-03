import type { RecepProfilePayload } from '../types'
import {
  KeyIcon,
  ShieldIcon,
  UserOutlineIcon,
} from './PerfilIcons'

interface RecepPerfilDetailsPanelProps {
  profile: RecepProfilePayload
  onEditProfile?: () => void
  onChangePassword?: () => void
}

// Panel derecho: información de la cuenta + seguridad
export function RecepPerfilDetailsPanel({
  profile,
  onChangePassword,
}: RecepPerfilDetailsPanelProps) {
  return (
    <div className="min-w-0 flex flex-col gap-4 h-full">
      {/* Sección 1: Información de la Cuenta */}
      <section className="rounded-2xl border border-border-tan bg-white p-4 sm:p-5 shadow-[0_2px_16px_rgba(35,78,70,0.04)] flex flex-col gap-4">
        <header className="flex items-center justify-between gap-3 pb-3 border-b border-border-tan/60">
          <div className="flex items-center gap-2 min-w-0">
            <UserOutlineIcon className="w-4.5 h-4.5 text-brand shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-charcoal truncate">
              Información de la Cuenta
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-sage bg-bone px-2.5 py-1 rounded-lg">
            Datos de Sesión
          </span>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="Nombre Completo" value={profile.fullName} />
          <Field label="Nombre de Usuario" value={profile.userName} />
          <Field label="Correo Electrónico" value={profile.email} />
          <Field label="Cargo / Rol de Cuenta" value={profile.role || 'Recepcionista'} highlighted />
        </div>

        <div className="rounded-xl bg-amber-50/70 border border-amber-200/60 p-3.5 flex items-start gap-2.5 text-xs text-amber-900 mt-1">
          <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            Los datos personales, rol y estado de la cuenta son administrados de forma centralizada por la administración de la clínica. Puedes actualizar tu contraseña de acceso en cualquier momento.
          </p>
        </div>
      </section>

      {/* Sección 2: Seguridad de la Cuenta */}
      <section className="rounded-2xl border border-border-tan bg-white p-4 sm:p-5 shadow-[0_2px_16px_rgba(35,78,70,0.04)] flex-1 flex flex-col justify-between gap-4">
        <div>
          <header className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-border-tan/60">
            <div className="flex items-center gap-2">
              <ShieldIcon className="w-4.5 h-4.5 text-brand shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-charcoal">
                Seguridad de la Cuenta
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              Autoservicio Activo
            </span>
          </header>

          <div className="rounded-xl bg-bone/80 border border-border-tan px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-charcoal">Contraseña de Acceso</p>
              <p className="text-xs sm:text-sm text-sage font-medium mt-0.5">
                {profile.passwordUpdatedLabel || 'Gestionada de forma segura'}
              </p>
            </div>
            <button
              type="button"
              onClick={onChangePassword}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal hover:bg-charcoal/90 text-white px-4 py-2.5 text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer active:translate-y-0.5 shrink-0"
            >
              <KeyIcon className="w-3.5 h-3.5" />
              <span>Cambiar Contraseña</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-sage">
          Para proteger la seguridad del sistema de la clínica, utiliza siempre una contraseña segura de al menos 8 caracteres.
        </p>
      </section>
    </div>
  )
}

function Field({
  label,
  value,
  highlighted = false,
}: {
  label: string
  value: string
  highlighted?: boolean
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-sage mb-1.5">
        {label}
      </p>
      <div
        className={`rounded-xl border border-border-tan px-3.5 py-2.5 ${
          highlighted ? 'bg-cream' : 'bg-bone/35'
        }`}
      >
        <p className="text-xs sm:text-sm font-semibold text-charcoal truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}
