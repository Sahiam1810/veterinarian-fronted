import { useState, type FormEvent } from 'react'
import { ViewPopup } from '../../components'

export interface PerfilAuxProps {
  onNotice?: (msg: string) => void
  userName?: string
  userEmail?: string
}

export function PerfilAux({ onNotice, userName = 'Laura Gómez', userEmail = 'auxiliar@huellitas.com' }: PerfilAuxProps) {
  // Profile info state
  const [name, setName] = useState(userName)
  const [email, setEmail] = useState(userEmail)
  const [phone, setPhone] = useState('+57 321 456 7890')
  const [docNumber, setDocNumber] = useState('1.094.876.543')
  const [roleName] = useState('Auxiliar de Veterinaria')
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150')

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault()
    onNotice?.('¡Información de perfil actualizada con éxito!')
  }

  const handleSavePassword = (e: FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      onNotice?.('Por favor completa todos los campos de contraseña')
      return
    }
    if (newPassword !== confirmPassword) {
      onNotice?.('La nueva contraseña y su confirmación no coinciden')
      return
    }
    onNotice?.('¡Contraseña actualizada con éxito!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleChangePhoto = () => {
    // Simulate updating photo
    const randomPhotos = [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150'
    ]
    const nextPhoto = randomPhotos[Math.floor(Math.random() * randomPhotos.length)]
    setPhotoUrl(nextPhoto)
    onNotice?.('Foto de perfil actualizada')
  }

  return (
    <ViewPopup animationKey="perfil" className="w-full flex flex-col lg:flex-row gap-5 sm:gap-6 min-w-0">
      
      {/* Columna Izquierda: Resumen del Perfil */}
      <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0">
        <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col items-center text-center gap-5">
          
          {/* Foto de Perfil */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-bone shadow-md bg-bone">
              <img
                src={photoUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleChangePhoto}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white hover:bg-bone border border-border-tan shadow-md flex items-center justify-center text-brand transition cursor-pointer"
              title="Cambiar foto de perfil"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Nombre y Rol */}
          <div>
            <h2 className="text-xl font-black text-brand leading-tight">
              {name}
            </h2>
            <p className="text-xs sm:text-sm text-sage font-semibold mt-1">
              {roleName}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#e8f3ef] text-brand border border-brand/10">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              Cuenta Activa
            </span>
          </div>

          {/* Información Rápida / Contacto */}
          <div className="w-full border-t border-border-tan/50 pt-4 flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2.5 text-xs text-charcoal">
              <svg className="w-4.5 h-4.5 text-sage shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{email}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-charcoal">
              <svg className="w-4.5 h-4.5 text-sage shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{phone}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-charcoal">
              <svg className="w-4.5 h-4.5 text-sage shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span>CC: {docNumber}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Columna Derecha: Formularios de Edición */}
      <div className="flex-1 flex flex-col gap-5 sm:gap-6 min-w-0">
        
        {/* Panel 1: Información Personal */}
        <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col gap-4">
          <h3 className="text-base sm:text-lg font-black text-brand border-b border-border-tan/50 pb-2">
            Información del Perfil
          </h3>

          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Documento de Identidad (CC)
              </label>
              <input
                type="text"
                required
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Cargo / Rol de Cuenta
              </label>
              <input
                type="text"
                disabled
                value={roleName}
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-sage bg-bone/35 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer active:translate-y-0.5"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        {/* Panel 2: Seguridad (Contraseña) */}
        <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col gap-4">
          <h3 className="text-base sm:text-lg font-black text-brand border-b border-border-tan/50 pb-2">
            Seguridad de la Cuenta
          </h3>

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
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
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
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#854d38] hover:bg-[#703d2a] text-white transition shadow-xs cursor-pointer active:translate-y-0.5"
              >
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>

      </div>

    </ViewPopup>
  )
}
