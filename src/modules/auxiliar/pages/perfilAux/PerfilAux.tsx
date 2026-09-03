import { useState, type FormEvent } from 'react'
import { ViewPopup } from '../../components'
import { useAuxPerfil } from '../../hooks'

export interface PerfilAuxProps {
  onNotice?: (msg: string) => void
  userName?: string
  userEmail?: string
}

export function PerfilAux({ onNotice, userName = 'Laura Gómez', userEmail = 'auxiliar@huellitas.com' }: PerfilAuxProps) {
  const {
    profile,
    isLoading,
    error,
    isChangingPassword,
    passwordError,
    reloadProfile,
    changePassword,
  } = useAuxPerfil()

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const displayName = profile?.fullName || userName
  const displayEmail = profile?.email || userEmail
  const displayUserName = profile?.userName || 'auxiliar'
  const displayRole = profile?.role || 'Auxiliar'
  const displayInitials = profile?.initials || displayName.slice(0, 2).toUpperCase()
  const displayStatus = profile?.accountStatus || 'Activo'

  const handleSavePassword = async (e: FormEvent) => {
    e.preventDefault()
    const result = await changePassword(currentPassword, newPassword, confirmPassword)
    if (result.success) {
      onNotice?.(result.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleChangePhoto = () => {
    const randomPhotos = [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
    ]
    const nextPhoto = randomPhotos[Math.floor(Math.random() * randomPhotos.length)]
    setPhotoUrl(nextPhoto)
    onNotice?.('Foto de perfil actualizada en la vista actual')
  }

  if (isLoading && !profile) {
    return (
      <ViewPopup animationKey="perfil-loading" className="w-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
          <p className="text-sm font-medium text-sage">Cargando información del perfil…</p>
        </div>
      </ViewPopup>
    )
  }

  return (
    <ViewPopup animationKey="perfil" className="w-full flex flex-col lg:flex-row gap-5 sm:gap-6 min-w-0">
      {/* Columna Izquierda: Resumen del Perfil */}
      <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0">
        <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col items-center text-center gap-5">
          {/* Foto / Avatar de Perfil */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-bone shadow-md bg-bone flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-brand to-emerald-700 text-white font-black text-2xl flex items-center justify-center">
                  {displayInitials}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleChangePhoto}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white hover:bg-bone border border-border-tan shadow-md flex items-center justify-center text-brand transition cursor-pointer"
              title="Cambiar foto de perfil"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          {/* Nombre, Usuario y Rol */}
          <div>
            <h2 className="text-xl font-black text-brand leading-tight">
              {displayName}
            </h2>
            <p className="text-xs text-charcoal/70 font-semibold mt-0.5">
              @{displayUserName}
            </p>
            <p className="text-xs sm:text-sm text-sage font-semibold mt-1">
              {displayRole}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#e8f3ef] text-brand border border-brand/10">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              Cuenta {displayStatus}
            </span>
          </div>

          {/* Información Rápida / Contacto */}
          <div className="w-full border-t border-border-tan/50 pt-4 flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2.5 text-xs text-charcoal">
              <svg className="w-4.5 h-4.5 text-sage shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="truncate" title={displayEmail}>{displayEmail}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-charcoal">
              <svg className="w-4.5 h-4.5 text-sage shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="truncate">Usuario: {displayUserName}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-charcoal">
              <svg className="w-4.5 h-4.5 text-sage shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Rol: {displayRole}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Información y Seguridad */}
      <div className="flex-1 flex flex-col gap-5 sm:gap-6 min-w-0">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs sm:text-sm flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void reloadProfile()}
              className="text-xs font-bold underline hover:no-underline cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Panel 1: Información Personal (Datos reales / Solo lectura con aviso) */}
        <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-tan/50 pb-2">
            <h3 className="text-base sm:text-lg font-black text-brand">
              Información de la Cuenta
            </h3>
            <span className="text-[11px] font-semibold text-sage bg-bone px-2.5 py-1 rounded-lg">
              Datos de Sesión
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Nombre Completo
              </label>
              <input
                type="text"
                disabled
                value={displayName}
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal bg-bone/35 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Nombre de Usuario
              </label>
              <input
                type="text"
                disabled
                value={displayUserName}
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal bg-bone/35 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                disabled
                value={displayEmail}
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal bg-bone/35 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Cargo / Rol de Cuenta
              </label>
              <input
                type="text"
                disabled
                value={displayRole}
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal bg-bone/35 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/70 border border-amber-200/60 p-3.5 flex items-start gap-2.5 text-xs text-amber-900 mt-1">
            <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Los datos personales, rol y estado de la cuenta son administrados de forma centralizada por la administración de la clínica. Puedes actualizar tu contraseña de acceso en la sección inferior.
            </p>
          </div>
        </div>

        {/* Panel 2: Seguridad (Contraseña conectada al backend real) */}
        <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-tan/50 pb-2">
            <h3 className="text-base sm:text-lg font-black text-brand">
              Seguridad de la Cuenta
            </h3>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              Autoservicio Activo
            </span>
          </div>

          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Contraseña Actual
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                disabled={isChangingPassword}
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs disabled:bg-bone/35"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  disabled={isChangingPassword}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs disabled:bg-bone/35"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  disabled={isChangingPassword}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs disabled:bg-bone/35"
                />
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#854d38] hover:bg-[#703d2a] text-white transition shadow-xs cursor-pointer active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isChangingPassword && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ViewPopup>
  )
}
