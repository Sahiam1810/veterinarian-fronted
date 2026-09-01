import { useState, useEffect, type FormEvent } from 'react'
import {
  SuperAdminHeader,
  SuperAdminSidebar,
  DashboardBackgroundDecoration,
} from '../../components'

export interface PerfilSuperAdminProps {
  onNavigate?: (routeId: string) => void
  activeRoute?: string
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onCloseSidebar?: () => void
  userName?: string
  userRole?: string
  onLogout?: () => void
}

export interface SuperAdminProfileData {
  fullName: string
  displayName: string
  email: string
  phone: string
  photoUrl: string
  jobTitle: string
  systemRole: string
  clinicName: string
  clinicBranch: string
  workHours: string
  accountStatus: 'activa' | 'inactiva'
}

export function PerfilSuperAdmin({
  onNavigate,
  activeRoute = 'perfil',
  isSidebarOpen: externalIsSidebarOpen,
  onToggleSidebar: externalOnToggleSidebar,
  onCloseSidebar: externalOnCloseSidebar,
  userName = 'SuperAdmin Veterinario',
  userRole = 'SuperAdministrador',
  onLogout,
}: PerfilSuperAdminProps = {}) {
  // Navigation & Sidebar
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false)
  const isSidebarOpen =
    externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen
  const toggleSidebar =
    externalOnToggleSidebar || (() => setInternalIsSidebarOpen((prev) => !prev))
  const closeSidebar =
    externalOnCloseSidebar || (() => setInternalIsSidebarOpen(false))

  // Profile data state
  const [profile, setProfile] = useState<SuperAdminProfileData>({
    fullName: userName,
    displayName: userName,
    email: 'superadmin@huellitas.com',
    phone: '+51 987 654 321',
    photoUrl: '', // Starts empty, will render placeholder or updated URL
    jobTitle: 'Super Administrador de la Clínica',
    systemRole: 'Super Administrador General',
    clinicName: 'Veterinaria Huellitas',
    clinicBranch: 'Sede Central',
    workHours: 'Lun - Sáb, 08:00 - 18:00',
    accountStatus: 'activa',
  })

  // Toast Notification
  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const showToast = (message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification(null)
    }, 3200)
  }

  // Sync userName prop if changed
  useEffect(() => {
    if (userName) {
      setProfile((prev) => ({
        ...prev,
        fullName: userName,
        displayName: userName,
      }))
    }
  }, [userName])

  const handleSidebarNavigate = (routeId: string) => {
    if (onNavigate) {
      onNavigate(routeId)
    }
  }

  // Active drawer state
  const [activeDrawer, setActiveDrawer] = useState<'edit' | 'password' | 'photo' | null>(null)

  // Handlers for drawer actions
  const handleSaveProfile = (updatedData: { fullName: string; email: string; phone: string }) => {
    setProfile((prev) => ({
      ...prev,
      fullName: updatedData.fullName,
      displayName: updatedData.fullName,
      email: updatedData.email,
      phone: updatedData.phone,
    }))
    showToast('Perfil actualizado correctamente.')
    setActiveDrawer(null)
  }

  const handleSavePassword = () => {
    showToast('Contraseña cambiada exitosamente.')
    setActiveDrawer(null)
  }

  const handleSavePhoto = (photoUrl: string) => {
    setProfile((prev) => ({
      ...prev,
      photoUrl,
    }))
    showToast('Foto de perfil actualizada correctamente.')
    setActiveDrawer(null)
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-bone relative text-charcoal">
      {/* 1. Top Header Fijo */}
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        userName={profile.displayName}
        userRole={userRole}
        onNotificationClick={() => showToast('Tienes 2 notificaciones del sistema')}
        onProfileClick={() => handleSidebarNavigate('perfil')}
      />

      {/* 2. Cuerpo Principal */}
      <div className="flex-1 flex overflow-hidden relative">
        <SuperAdminSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleSidebarNavigate}
          onLogout={onLogout}
        />

        <main
          key={activeRoute}
          className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8 animate-view-popup"
        >
          <DashboardBackgroundDecoration />

          {/* Toast Notification */}
          {activeNotification && (
            <div
              className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-brand text-white text-xs sm:text-sm font-semibold shadow-lg border border-white/20 flex items-center gap-2 pointer-events-none"
              role="alert"
            >
              <svg className="w-4 h-4 text-ochre shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              <span>{activeNotification}</span>
            </div>
          )}

          {/* Grid Layout Principal */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch gap-5 max-w-5xl mx-auto pt-4">
            {/* Columna Izquierda: Tarjeta Resumen */}
            <aside className="w-full lg:w-[280px] shrink-0 flex flex-col items-center text-center bg-white border border-border-tan rounded-2xl p-5 shadow-[0_4px_20px_rgba(35,78,70,0.03)] animate-pop-in stagger-1">
              <div className="relative mb-4">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.displayName}
                    className="w-24 h-24 rounded-2xl object-cover border border-border-tan"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-bone border border-border-tan flex items-center justify-center text-brand text-4xl font-extrabold shadow-inner select-none">
                    {profile.displayName.charAt(0)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setActiveDrawer('photo')}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand hover:bg-brand-hover text-white border-2 border-white shadow-md inline-flex items-center justify-center transition cursor-pointer"
                  title="Cambiar foto de perfil"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              <h2 className="text-lg font-black text-brand tracking-tight leading-tight px-1 truncate max-w-full">
                {profile.displayName}
              </h2>
              <p className="text-xs text-sage font-bold mt-1 tracking-wide">
                {profile.jobTitle}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F2EF] text-brand border border-brand/15">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                Cuenta Activa
              </span>

              {/* Botones rápidos en la base de la tarjeta resumen */}
              <div className="w-full mt-8 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setActiveDrawer('edit')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white py-2.5 text-xs sm:text-sm font-bold hover:bg-brand-hover transition cursor-pointer shadow-xs active:translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Editar Perfil</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawer('password')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-brand/35 bg-white text-brand py-2.5 text-xs sm:text-sm font-bold hover:bg-sage-soft/50 transition cursor-pointer shadow-2xs active:translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Cambiar Contraseña</span>
                </button>
              </div>
            </aside>

            {/* Columna Derecha: Detalles */}
            <div className="flex-1 flex flex-col gap-5 animate-pop-in stagger-2">
              {/* Información Personal */}
              <section className="bg-white border border-border-tan rounded-2xl p-5 shadow-[0_4px_20px_rgba(35,78,70,0.03)]">
                <header className="flex items-center gap-2 pb-2.5 mb-4 border-b border-brand/20">
                  <svg className="w-5 h-5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-sm sm:text-base font-black text-brand">
                    Información Personal
                  </h3>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailField label="Nombre Completo" value={profile.fullName} />
                  <DetailField label="Rol en Sistema" value={profile.systemRole} />
                  <DetailField
                    label="Correo Electrónico"
                    value={profile.email}
                    icon={
                      <svg className="w-4 h-4 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                  <DetailField
                    label="Teléfono de Contacto"
                    value={profile.phone}
                    icon={
                      <svg className="w-4 h-4 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    }
                  />
                </div>
              </section>

              {/* Información Profesional / Operativa */}
              <section className="bg-white border border-border-tan rounded-2xl p-5 shadow-[0_4px_20px_rgba(35,78,70,0.03)]">
                <header className="flex items-center gap-2 pb-2.5 mb-4 border-b border-brand/20">
                  <svg className="w-5 h-5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-sm sm:text-base font-black text-brand">
                    Información Operativa
                  </h3>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TagField label="Clínica" value={profile.clinicName} />
                  <TagField label="Sede Principal" value={profile.clinicBranch} />
                  <TagField label="Horario de Trabajo" value={profile.workHours} />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Drawers modulares */}
      <EditProfileDrawer
        isOpen={activeDrawer === 'edit'}
        profile={profile}
        onClose={() => setActiveDrawer(null)}
        onSave={handleSaveProfile}
      />

      <ChangePasswordDrawer
        isOpen={activeDrawer === 'password'}
        onClose={() => setActiveDrawer(null)}
        onSave={handleSavePassword}
      />

      <ChangePhotoDrawer
        isOpen={activeDrawer === 'photo'}
        photoUrl={profile.photoUrl}
        onClose={() => setActiveDrawer(null)}
        onSave={handleSavePhoto}
      />
    </div>
  )
}

/* ============================================================================
   SUBCOMPONENTE: CAMPOS DETALLES
   ============================================================================ */
function DetailField({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="min-w-0 rounded-xl bg-bone/40 border border-border-tan/50 px-4 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-sage">{label}</p>
      <p className="mt-1 text-xs sm:text-sm font-bold text-charcoal flex items-center gap-2 truncate">
        {icon}
        <span className="truncate" title={value}>
          {value}
        </span>
      </p>
    </div>
  )
}

function TagField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-sage mb-1.5">{label}</p>
      <div className="rounded-xl bg-[#F5F3EE] border border-border-tan/70 px-4 py-2.5">
        <p className="text-xs sm:text-sm font-bold text-charcoal truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}

/* ============================================================================
   DRAWERS MODULARES
   ============================================================================ */
interface DrawerBaseProps {
  isOpen: boolean
  onClose: () => void
}

function EditProfileDrawer({
  isOpen,
  profile,
  onClose,
  onSave,
}: DrawerBaseProps & {
  profile: SuperAdminProfileData
  onSave: (data: { fullName: string; email: string; phone: string }) => void
}) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)

  const [fullName, setFullName] = useState(profile.fullName)
  const [email, setEmail] = useState(profile.email)
  const [phone, setPhone] = useState(profile.phone)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setFullName(profile.fullName)
      setEmail(profile.email)
      setPhone(profile.phone)
      setError(null)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isRendered, profile])

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsRendered(false)
      setIsClosing(false)
    }, 230)
  }

  if (!isRendered && !isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Todos los campos son obligatorios.')
      return
    }
    onSave({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim() })
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full sm:w-[420px] lg:w-[450px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-bold text-brand">Editar Perfil</h3>
          </div>
          <button type="button" onClick={handleClose} className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Nombre Completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Teléfono de Contacto</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div className="pt-4 border-t border-border-tan/60 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={handleClose} className="px-4 py-2.5 rounded-xl border border-border-tan text-sage font-bold hover:bg-bone hover:text-charcoal transition cursor-pointer">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition shadow-xs cursor-pointer">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ChangePasswordDrawer({
  isOpen,
  onClose,
  onSave,
}: DrawerBaseProps & {
  onSave: () => void
}) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError(null)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isRendered])

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsRendered(false)
      setIsClosing(false)
    }, 230)
  }

  if (!isRendered && !isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Todos los campos son obligatorios.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }
    onSave()
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full sm:w-[420px] lg:w-[450px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white shrink-0">
          <h3 className="text-xl font-bold text-brand">Cambiar Contraseña</h3>
          <button type="button" onClick={handleClose} className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Contraseña Actual</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Nueva Contraseña</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div className="pt-4 border-t border-border-tan/60 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={handleClose} className="px-4 py-2.5 rounded-xl border border-border-tan text-sage font-bold hover:bg-bone hover:text-charcoal transition cursor-pointer">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition shadow-xs cursor-pointer">
              Cambiar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ChangePhotoDrawer({
  isOpen,
  photoUrl,
  onClose,
  onSave,
}: DrawerBaseProps & {
  photoUrl: string
  onSave: (url: string) => void
}) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)

  const [url, setUrl] = useState(photoUrl)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setUrl(photoUrl)
      setError(null)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isRendered, photoUrl])

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsRendered(false)
      setIsClosing(false)
    }, 230)
  }

  if (!isRendered && !isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSave(url.trim())
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full sm:w-[420px] lg:w-[450px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white shrink-0">
          <h3 className="text-xl font-bold text-brand">Actualizar Foto</h3>
          <button type="button" onClick={handleClose} className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-charcoal mb-1.5">URL de Foto de Perfil</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com/mi-foto.jpg"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div className="pt-4 border-t border-border-tan/60 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={handleClose} className="px-4 py-2.5 rounded-xl border border-border-tan text-sage font-bold hover:bg-bone hover:text-charcoal transition cursor-pointer">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition shadow-xs cursor-pointer">
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
