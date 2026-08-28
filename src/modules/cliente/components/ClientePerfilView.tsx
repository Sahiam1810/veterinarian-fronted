import type { ClienteProfilePayload } from '../types'

interface ClientePerfilViewProps {
  profile: ClienteProfilePayload
  onEditProfile?: () => void
  onChangePassword?: () => void
  onViewAccountStatements?: () => void
}

export function ClientePerfilView({
  profile,
  onEditProfile,
  onChangePassword,
  onViewAccountStatements,
}: ClientePerfilViewProps) {
  return (
    <section className="h-full min-h-0 min-w-0 overflow-hidden">
      <div className="h-full min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1.75fr)_minmax(260px,1fr)] gap-4 items-stretch">
        <div className="min-h-0 min-w-0 flex flex-col gap-4 h-full">
          <article className="flex-1 min-h-0 bg-white rounded-3xl border border-border-tan shadow-sm p-5 sm:p-6 flex flex-col min-w-0">
            <div className="flex items-center justify-between gap-3 mb-5 shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-brand">Información Personal</h2>
              <button
                type="button"
                onClick={onEditProfile}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-terracotta hover:text-terracotta/80 transition cursor-pointer shrink-0"
              >
                <EditIcon className="w-4 h-4" />
                Editar
              </button>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 flex-1 content-start">
              <InfoRow label="Nombre completo" value={profile.displayName} />
              <InfoRow label="Documento de identidad" value={profile.documentId} />
              <InfoRow label="Correo electrónico" value={profile.email} />
              <InfoRow label="Teléfono" value={profile.phone} />
              <InfoRow label="Dirección" value={profile.address} className="sm:col-span-2" />
              <InfoRow label="Fecha de registro" value={profile.registeredAtLabel} />
            </dl>
          </article>

          <article className="shrink-0 bg-white rounded-3xl border border-border-tan shadow-sm p-5 sm:p-6 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-brand mb-4">Seguridad</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-bone/40 border border-border-tan/60 px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-bold text-charcoal">Contraseña</p>
                <p className="text-sm text-sage mt-0.5">{profile.passwordUpdatedLabel}</p>
              </div>
              <button
                type="button"
                onClick={onChangePassword}
                className="inline-flex items-center justify-center rounded-xl border border-border-tan bg-white px-4 py-2.5 text-sm font-bold text-charcoal hover:bg-bone transition cursor-pointer shrink-0 self-start sm:self-auto"
              >
                Cambiar contraseña
              </button>
            </div>
          </article>
        </div>

        <aside className="min-h-0 min-w-0 h-full">
          <article className="h-full bg-brand rounded-3xl text-white p-5 sm:p-6 shadow-sm flex flex-col gap-4 min-w-0">
            <h2 className="text-lg font-bold text-white/95 shrink-0">Estado de Cuenta</h2>

            <div className="flex items-start gap-3 shrink-0">
              <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <CheckCircleIcon className="w-5 h-5 text-emerald-200" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/70">
                  Estado actual
                </p>
                <p className="text-base font-bold mt-0.5">{profile.accountStatus.statusLabel}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-brand-darker/40 border border-white/10 p-4 space-y-2 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-white/85">{profile.accountStatus.balanceLabel}</span>
                <span className="text-lg font-extrabold">{profile.accountStatus.balanceAmount}</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {profile.accountStatus.lastProcessedLabel}
              </p>
            </div>

            <div className="flex-1 min-h-[1rem]" aria-hidden />

            <button
              type="button"
              onClick={onViewAccountStatements}
              className="shrink-0 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-darkest hover:bg-brand-darkest/90 text-white px-4 py-3 text-sm font-bold transition cursor-pointer"
            >
              <DocIcon className="w-4 h-4 shrink-0" />
              Ver estados de cuenta
            </button>
          </article>
        </aside>
      </div>
    </section>
  )
}

function InfoRow({
  label,
  value,
  className = '',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-sage">{label}</dt>
      <dd className="text-sm sm:text-base font-semibold text-charcoal mt-1 break-words">{value}</dd>
    </div>
  )
}

function EditIcon({ className = 'w-4 h-4' }: { className?: string }) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function CheckCircleIcon({ className = 'w-5 h-5' }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
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
