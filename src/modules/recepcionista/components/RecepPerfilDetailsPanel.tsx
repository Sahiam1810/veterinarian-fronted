import type { RecepProfilePayload } from '../types'
import {
  KeyIcon,
  PencilIcon,
  ShieldIcon,
  UserOutlineIcon,
} from './PerfilIcons'

interface RecepPerfilDetailsPanelProps {
  profile: RecepProfilePayload
  onEditProfile?: () => void
  onChangePassword?: () => void
}

// Panel derecho: información personal + seguridad de la cuenta
export function RecepPerfilDetailsPanel({
  profile,
  onEditProfile,
  onChangePassword,
}: RecepPerfilDetailsPanelProps) {
  return (
    <div className="min-w-0 flex flex-col gap-4 h-full">
      <section className="rounded-2xl border border-border-tan bg-white p-4 sm:p-5 shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
        <header className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-border-tan">
          <div className="flex items-center gap-2 min-w-0">
            <UserOutlineIcon className="w-4.5 h-4.5 text-brand shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-charcoal truncate">
              Información Personal
            </h3>
          </div>
          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex items-center gap-2 rounded-xl bg-brand text-white px-3 py-2 text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer shrink-0"
          >
            <PencilIcon className="w-3.5 h-3.5" />
            <span>Editar Perfil</span>
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nombre Completo" value={profile.fullName} />
          <Field label="Correo de Contacto" value={profile.email} />
          <Field label="Teléfono Móvil" value={profile.phone} />
          <Field
            label="Fecha de Incorporación"
            value={profile.hireDateLabel}
            highlighted
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border-tan bg-white p-4 sm:p-5 shadow-[0_2px_16px_rgba(35,78,70,0.04)] flex-1">
        <header className="flex items-center gap-2 pb-3 mb-4 border-b border-border-tan">
          <ShieldIcon className="w-4.5 h-4.5 text-brand shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-charcoal">
            Seguridad de la Cuenta
          </h3>
        </header>

        <div className="rounded-xl bg-bone/80 border border-border-tan px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-charcoal">Contraseña</p>
            <p className="text-xs sm:text-sm text-sage font-medium mt-0.5">
              {profile.passwordUpdatedLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onChangePassword}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal text-white px-3.5 py-2.5 text-xs sm:text-sm font-bold hover:bg-charcoal/90 transition cursor-pointer shrink-0"
          >
            <KeyIcon className="w-3.5 h-3.5" />
            <span>Cambiar Contraseña</span>
          </button>
        </div>
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
        className={`rounded-xl border border-border-tan px-3 py-2.5 ${
          highlighted ? 'bg-cream' : 'bg-white'
        }`}
      >
        <p className="text-sm font-semibold text-charcoal truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}
