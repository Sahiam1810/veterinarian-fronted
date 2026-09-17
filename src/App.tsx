import { useEffect, useState } from 'react'
import {
  LoginPage,
  useAuth,
  fetchMyModulePermissions,
  type AuthUser,
} from '@/modules/auth'
import type { ModuleId } from '@/modules/superadmin/types'
import {
  DashboardSuperAdmin,
  UserSuperAdmin,
  MascotasSuperAdmin,
  ProfesionalesSuperAdmin,
  ServiciosSuperAdmin,
  EspeciesRazasSuperAdmin,
  DiagnosticosSuperAdmin,
  AgendaSuperAdmin,
  ReportesSuperAdmin,
  PerfilSuperAdmin,
} from '@/modules/superadmin'
import { useAdminShellAccess, useNotificationsSuperAdmin } from '@/modules/superadmin/hooks'
import { PuntoInicio as VetPuntoInicio } from '@/modules/veterinario'
import { PuntoInicio as RecepPuntoInicio } from '@/modules/recepcionista'

const ROUTE_TO_MODULE: Record<string, ModuleId> = {
  inicio: 'inicio',
  usuarios: 'usuarios',
  mascotas: 'mascotas',
  duenos: 'duenos',
  'especies-razas': 'especiesRazas',
  servicios: 'servicios',
  diagnosticos: 'historiaClinica',
  profesionales: 'profesionales',
  agenda: 'agenda',
  reportes: 'reportes',
}

export default function App() {
  const {
    currentUser,
    login,
    logout,
    isSubmitting,
    error,
  } = useAuth()

  const role = (currentUser?.role || '').toLowerCase()
  const roleName = (currentUser?.roleName || '').toLowerCase()

  const isCliente = role === 'cliente' || roleName === 'cliente' || roleName.includes('cliente')
  const isVeterinario = role === 'veterinario' || roleName.includes('veterinario')
  const isRecepcionista = role === 'recepcionista' || roleName.includes('recepcion')
  const isAuxiliar = role === 'auxiliar' || roleName.includes('auxiliar')
  const isKnownAdmin =
    role === 'superadmin' || role === 'admin' || roleName.includes('admin') || roleName.includes('superadmin')

  // Rol configurable/personalizado (ej. Practicante, Auditor): ni un rol Staff
  // conocido ni Cliente. Acceso solo con Plataforma:AccesoWeb.
  const isCustomRole =
    !!currentUser &&
    !isCliente &&
    !isVeterinario &&
    !isRecepcionista &&
    !isAuxiliar &&
    !isKnownAdmin

  const [platformAccess, setPlatformAccess] = useState<'checking' | 'granted' | 'denied'>('checking')

  useEffect(() => {
    if (!isCustomRole) return

    let cancelled = false
    setPlatformAccess('checking')

    void fetchMyModulePermissions()
      .then((permissions) => {
        if (cancelled) return
        setPlatformAccess(permissions.Plataforma?.canView ? 'granted' : 'denied')
      })
      .catch(() => {
        if (!cancelled) setPlatformAccess('denied')
      })

    return () => {
      cancelled = true
    }
  }, [isCustomRole, currentUser?.id])

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={login}
        isSubmitting={isSubmitting}
        error={error}
      />
    )
  }

  // Bloqueo explícito de clientes
  if (isCliente) {
    logout()
    return (
      <LoginPage
        onLogin={login}
        isSubmitting={isSubmitting}
        error="Este correo no tiene permisos de sesión para el panel. Los clientes solo usan Telegram o el chatbot."
      />
    )
  }

  // Vet/Recep conservan shell propio (chat, nueva atención); autorización ya lee /permissions
  if (isVeterinario) {
    return (
      <VetPuntoInicio
        userName={currentUser.name}
        userRole={currentUser.roleName}
        onLogout={logout}
      />
    )
  }

  if (isRecepcionista) {
    return (
      <RecepPuntoInicio
        userName={currentUser.name}
        userRole={currentUser.roleName}
        onLogout={logout}
      />
    )
  }

  // Auxiliar y admin: mismo shell permission-first (menú/rutas por canView)
  if (isAuxiliar || isKnownAdmin) {
    return <SuperAdminApp user={currentUser} onLogout={logout} />
  }

  // Rol custom: gate Plataforma antes de entrar al shell filtrado
  if (platformAccess === 'checking') {
    return <PlatformAccessCheckScreen />
  }

  if (platformAccess === 'granted') {
    return <SuperAdminApp user={currentUser} onLogout={logout} />
  }

  logout()
  return (
    <LoginPage
      onLogin={login}
      isSubmitting={isSubmitting}
      error="Tu rol no tiene acceso concedido al panel web. Pídele a un administrador que active el permiso 'Plataforma' para tu rol."
    />
  )
}

function PlatformAccessCheckScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-charcoal">
      <p className="text-sm font-medium text-sage">Verificando acceso…</p>
    </div>
  )
}

// Shell staff permission-first: rutas y acciones según /api/auth/permissions
function SuperAdminApp({
  user,
  onLogout,
}: {
  user: AuthUser
  onLogout: () => void
}) {
  const isPlatformSuperAdmin = !!user.isPlatformSuperAdmin
  const {
    canViewModule,
    canCreateModule,
    canEditModule,
    canDeleteModule,
    firstAllowedRoute,
  } = useAdminShellAccess({
    personId: user.personId || user.id,
    accountId: user.userAccountId,
    email: user.email,
    roleId: user.roleId,
    isPlatformSuperAdmin,
  })
  const {
    notifications,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    markAsRead: onMarkNotificationRead,
    markAllAsRead: onMarkAllNotificationsRead,
    reload: onReloadNotifications,
  } = useNotificationsSuperAdmin(user.personId || user.id)

  const [currentRoute, setCurrentRoute] = useState<string>('inicio')
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  useEffect(() => {
    const moduleId = ROUTE_TO_MODULE[currentRoute]
    if (moduleId && !canViewModule(moduleId)) {
      setCurrentRoute(firstAllowedRoute)
    }
  }, [canViewModule, currentRoute, firstAllowedRoute])

  const handleNavigate = (routeId: string) => {
    if (routeId === 'logout') {
      onLogout()
      return
    }
    const moduleId = ROUTE_TO_MODULE[routeId]
    if (moduleId && !canViewModule(moduleId)) {
      return
    }
    setCurrentRoute(routeId)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const shellProps = {
    onNavigate: handleNavigate,
    isSidebarOpen,
    onToggleSidebar: toggleSidebar,
    onCloseSidebar: closeSidebar,
    userName: user.name,
    userRole: user.roleName,
    onProfileClick: () => handleNavigate('perfil'),
    onLogout,
    canViewModule,
    canCreateModule,
    canEditModule,
    canDeleteModule,
    notifications,
    isLoadingNotifications,
    notificationsError,
    onMarkNotificationRead,
    onMarkAllNotificationsRead,
    onReloadNotifications,
  }

  if (currentRoute === 'usuarios') {
    return (
      <UserSuperAdmin
        {...shellProps}
        activeRoute="usuarios"
        canManagePermissions={isPlatformSuperAdmin}
      />
    )
  }

  if (currentRoute === 'mascotas' || currentRoute === 'duenos') {
    return (
      <MascotasSuperAdmin
        {...shellProps}
        activeRoute="mascotas"
      />
    )
  }

  if (currentRoute === 'profesionales') {
    return (
      <ProfesionalesSuperAdmin
        {...shellProps}
        activeRoute="profesionales"
      />
    )
  }

  if (currentRoute === 'especies-razas') {
    return (
      <EspeciesRazasSuperAdmin
        {...shellProps}
        activeRoute="especies-razas"
      />
    )
  }

  if (currentRoute === 'servicios') {
    return (
      <ServiciosSuperAdmin
        {...shellProps}
        activeRoute="servicios"
      />
    )
  }

  if (currentRoute === 'diagnosticos') {
    return (
      <DiagnosticosSuperAdmin
        {...shellProps}
        activeRoute="diagnosticos"
      />
    )
  }

  if (currentRoute === 'agenda') {
    return (
      <AgendaSuperAdmin
        {...shellProps}
        activeRoute="agenda"
      />
    )
  }

  if (currentRoute === 'reportes') {
    return (
      <ReportesSuperAdmin
        {...shellProps}
        activeRoute="reportes"
      />
    )
  }

  if (currentRoute === 'perfil') {
    return (
      <PerfilSuperAdmin
        {...shellProps}
        activeRoute="perfil"
      />
    )
  }
  return (
    <DashboardSuperAdmin
      {...shellProps}
      activeRoute={currentRoute}
    />
  )
}
