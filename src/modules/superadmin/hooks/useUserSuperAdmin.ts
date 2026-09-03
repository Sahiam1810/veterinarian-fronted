import { useState, useMemo, useEffect, useCallback } from 'react'
import type {
  SystemUser,
  RoleDefinition,
  ModuleId,
  ModuleInfo,
  ModulePermission,
  UserFilters,
  UserStatus,
  UserFormData,
  PermissionTarget,
  UserSaveResult,
} from '../types'
import { extractUserApiErrorMessage } from '../utils/translateUserApiError'
import {
  fetchUsers,
  createFullUser as apiCreateFullUser,
  updateUser as apiUpdateUser,
  activateUser as apiActivateUser,
  deactivateUser as apiDeactivateUser,
  type ApiUserResponse,
} from '../services/superAdminUserService'
import {
  fetchRoles,
  createRole as apiCreateRole,
  type ApiRoleResponse,
} from '../services/superAdminRolesService'
import {
  fetchModules,
  type ApiModuleResponse,
} from '../services/superAdminModulesService'
import {
  fetchAllRolePermissions,
  createRolePermission as apiCreateRolePermission,
  updateRolePermission as apiUpdateRolePermission,
  fetchAllUserPermissions,
  createUserPermission as apiCreateUserPermission,
  updateUserPermission as apiUpdateUserPermission,
  type ApiRolePermissionResponse,
  type ApiUserPermissionResponse,
} from '../services/superAdminPermissionsService'
import { ApiError } from '@/services'
import {
  clearUserUiShellOverrides,
  getUiShellOverrides,
  isUiShellModule,
  setUiShellOverrides,
  setUserUiShellOverrides,
  UI_SHELL_MODULE_IDS,
} from '../utils/uiShellPermissionsStorage'

export const MODULES_INFO: ModuleInfo[] = [
  { id: 'usuarios', label: 'Usuarios', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'mascotas', label: 'Mascotas', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'duenos', label: 'Dueños', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'servicios', label: 'Servicios', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'profesionales', label: 'Profesionales', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'disponibilidad', label: 'Disponibilidad', supportsCreate: true, supportsEdit: true, supportsDelete: false },
  { id: 'agenda', label: 'Agenda', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'historiaClinica', label: 'Historia Clínica', supportsCreate: true, supportsEdit: true, supportsDelete: false },
  { id: 'reportes', label: 'Reportes', supportsCreate: false, supportsEdit: false, supportsDelete: false },
  { id: 'inicio', label: 'Inicio', supportsCreate: false, supportsEdit: false, supportsDelete: false },
]

const DEFAULT_PERMISSIONS_ALL: Record<ModuleId, ModulePermission> = {
  inicio: { view: true, create: true, edit: true, delete: true },
  usuarios: { view: true, create: true, edit: true, delete: true },
  duenos: { view: true, create: true, edit: true, delete: true },
  mascotas: { view: true, create: true, edit: true, delete: true },
  servicios: { view: true, create: true, edit: true, delete: true },
  profesionales: { view: true, create: true, edit: true, delete: true },
  disponibilidad: { view: true, create: true, edit: true, delete: true },
  agenda: { view: true, create: true, edit: true, delete: true },
  historiaClinica: { view: true, create: true, edit: true, delete: true },
  reportes: { view: true, create: true, edit: true, delete: true },
}

const DEFAULT_PERMISSIONS_EMPTY: Record<ModuleId, ModulePermission> = {
  inicio: { view: false, create: false, edit: false, delete: false },
  usuarios: { view: false, create: false, edit: false, delete: false },
  duenos: { view: false, create: false, edit: false, delete: false },
  mascotas: { view: false, create: false, edit: false, delete: false },
  servicios: { view: false, create: false, edit: false, delete: false },
  profesionales: { view: false, create: false, edit: false, delete: false },
  disponibilidad: { view: false, create: false, edit: false, delete: false },
  agenda: { view: false, create: false, edit: false, delete: false },
  historiaClinica: { view: false, create: false, edit: false, delete: false },
  reportes: { view: false, create: false, edit: false, delete: false },
}

function normalizeModuleName(name: string): ModuleId | null {
  const norm = name.trim().toLowerCase()
  if (norm.includes('usuario')) return 'usuarios'
  if (norm.includes('mascota')) return 'mascotas'
  if (norm.includes('dueño') || norm.includes('dueno') || norm.includes('cliente')) return 'duenos'
  if (norm.includes('servicio')) return 'servicios'
  if (norm.includes('profesional') || norm.includes('veterinar')) return 'profesionales'
  if (norm.includes('disponib')) return 'disponibilidad'
  if (norm.includes('cita') || norm.includes('agenda')) return 'agenda'
  if (norm.includes('historial') || norm.includes('historia')) return 'historiaClinica'
  if (norm.includes('reporte')) return 'reportes'
  if (norm.includes('inicio')) return 'inicio'
  return null
}

// Solo el SuperAdmin de plataforma (.env); "Administrador" es un rol normal editable
function isPlatformSuperAdminRoleName(name: string): boolean {
  const n = name.trim().toLowerCase()
  return n.includes('superadmin') || n.includes('super admin')
}

// Rol Administrador (panel completo por defecto, editable por SuperAdmin)
function isClinicAdminRoleName(name: string): boolean {
  const n = name.trim().toLowerCase()
  if (isPlatformSuperAdminRoleName(n)) return false
  return n.includes('administrador') || n === 'admin' || n.startsWith('admin ')
}

function formatDate(isoString: string): string {
  if (!isoString) return 'Reciente'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function useUserSuperAdmin() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [dbModules, setDbModules] = useState<ApiModuleResponse[]>([])
  const [rawRolePermissions, setRawRolePermissions] = useState<ApiRolePermissionResponse[]>([])
  const [rawUserPermissions, setRawUserPermissions] = useState<ApiUserPermissionResponse[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [permissionTarget, setPermissionTarget] = useState<PermissionTarget>({
    type: 'role',
    id: '',
  })
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [activeRoleSimulated, setActiveRoleSimulated] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'usuarios' | 'roles'>('usuarios')
  const [pendingSelectUserId, setPendingSelectUserId] = useState<string | null>(null)
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)

  // Filters state
  const [filters, setFilters] = useState<UserFilters>({
    searchQuery: '',
    roleFilter: 'all',
    statusFilter: 'all',
  })

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((current) => (current === message ? null : current))
    }, 3500)
  }, [])

  // Cargar datos reales desde el backend
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [usersRes, rolesRes, modulesRes, rolePermsRes, userPermsRes] = await Promise.allSettled([
        fetchUsers(),
        fetchRoles(),
        fetchModules(),
        fetchAllRolePermissions(),
        fetchAllUserPermissions(),
      ])

      const rejected = [usersRes, rolesRes, modulesRes, rolePermsRes, userPermsRes]
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')

      if (rejected.length > 0) {
        const first = rejected[0].reason
        const status = first instanceof ApiError ? first.status : 0
        if (status === 401) {
          showToast('Sesión expirada. Cierra sesión e inicia de nuevo.')
        } else {
          const msg = first instanceof Error ? first.message : 'No se pudieron cargar usuarios y roles.'
          showToast(msg)
        }
      }

      const fetchedRoles: ApiRoleResponse[] = rolesRes.status === 'fulfilled' ? rolesRes.value : []
      const fetchedModules: ApiModuleResponse[] = modulesRes.status === 'fulfilled' ? modulesRes.value : []
      const fetchedRolePerms: ApiRolePermissionResponse[] = rolePermsRes.status === 'fulfilled' ? rolePermsRes.value : []
      const fetchedUserPerms: ApiUserPermissionResponse[] = userPermsRes.status === 'fulfilled' ? userPermsRes.value : []
      const fetchedUsers: ApiUserResponse[] = usersRes.status === 'fulfilled' ? usersRes.value : []

      setDbModules(fetchedModules)
      setRawRolePermissions(fetchedRolePerms)
      setRawUserPermissions(fetchedUserPerms)

      // Módulo ID a ModuleId
      const moduleMap = new Map<string, ModuleId>()
      fetchedModules.forEach((m) => {
        const normalized = normalizeModuleName(m.name)
        if (normalized) {
          moduleMap.set(m.id.toLowerCase(), normalized)
        }
      })

      // Mapear Roles
      const mappedRoles: RoleDefinition[] = fetchedRoles.map((r) => {
        const isPlatformSuper = isPlatformSuperAdminRoleName(r.name)
        const isClinicAdmin = isClinicAdminRoleName(r.name)
        // Admin de clínica parte con todas las vistas del panel (como SuperAdmin UI)
        const perms: Record<ModuleId, ModulePermission> =
          isPlatformSuper || isClinicAdmin
            ? { ...DEFAULT_PERMISSIONS_ALL }
            : { ...DEFAULT_PERMISSIONS_EMPTY }

        // Aplicar permisos desde la tabla ROLE_PERMISSIONS
        const rolePerms = fetchedRolePerms.filter((rp) => rp.roleId.toLowerCase() === r.id.toLowerCase())
        rolePerms.forEach((rp) => {
          const modId = moduleMap.get(rp.moduleId.toLowerCase())
          if (modId) {
            perms[modId] = {
              view: rp.canView,
              create: rp.canCreate,
              edit: rp.canEdit,
              delete: rp.canDelete,
            }
          }
        })

        // Inicio/Reportes no están en Oracle: se guardan en local hasta tener módulos reales
        const uiRoleOverrides = getUiShellOverrides('role', r.id)
        for (const modId of UI_SHELL_MODULE_IDS) {
          if (uiRoleOverrides[modId]) {
            perms[modId] = uiRoleOverrides[modId]!
          }
        }

        return {
          id: r.id,
          name: r.name,
          description: r.description || 'Sin descripción',
          isSystem: isPlatformSuper,
          permissions: perms,
        }
      })

      // Mapear Usuarios
      const rolesMap = new Map<string, string>()
      mappedRoles.forEach((r) => rolesMap.set(r.id.toLowerCase(), r.name))

      const mappedUsers: SystemUser[] = fetchedUsers.map((u) => {
        const roleName = rolesMap.get(u.roleId.toLowerCase()) || 'Usuario'
        const parts = u.fullName.trim().split(' ')
        const firstName = parts[0] || ''
        const lastName = parts.slice(1).join(' ') || ''

        // Permisos personalizados de usuario
        const userCustomPerms: Partial<Record<ModuleId, ModulePermission>> = {}
        const userPerms = fetchedUserPerms.filter((up) => up.userId.toLowerCase() === u.id.toLowerCase())
        userPerms.forEach((up) => {
          const modId = moduleMap.get(up.moduleId.toLowerCase())
          if (modId) {
            userCustomPerms[modId] = {
              view: up.canView,
              create: up.canCreate,
              edit: up.canEdit,
              delete: up.canDelete,
            }
          }
        })

        const uiUserOverrides = getUiShellOverrides('user', u.id)
        const uiEmailOverrides = getUiShellOverrides('email', u.email)
        for (const modId of UI_SHELL_MODULE_IDS) {
          if (uiEmailOverrides[modId]) {
            userCustomPerms[modId] = uiEmailOverrides[modId]
          }
          if (uiUserOverrides[modId]) {
            userCustomPerms[modId] = uiUserOverrides[modId]
          }
        }

        return {
          id: u.id,
          name: u.fullName,
          firstName,
          lastName,
          email: u.email,
          roleId: u.roleId,
          roleName,
          status: (u.isActive ? 'Activo' : 'Inactivo') as UserStatus,
          registrationDate: formatDate(u.createdAt),
          customPermissions: Object.keys(userCustomPerms).length > 0 ? userCustomPerms : undefined,
        }
      })

      setRoles(mappedRoles)
      setUsers(mappedUsers)

      // No resetear el objetivo de permisos en cada recarga (evita que se "remarquen" solos)
      setSelectedRoleId((prev) => prev || mappedRoles[0]?.id || '')
      setActiveRoleSimulated((prev) => prev || mappedRoles[0]?.id || '')
      setPermissionTarget((prev) => {
        if (prev.id) return prev
        if (mappedRoles[0]) return { type: 'role', id: mappedRoles[0].id }
        return prev
      })
    } catch (err) {
      console.error('Error al cargar datos de usuarios y roles', err)
      showToast('Error al conectar con la base de datos.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // Target switcher helpers
  const selectRoleTarget = (roleId: string) => {
    setSelectedRoleId(roleId)
    setPermissionTarget({ type: 'role', id: roleId })
  }

  const selectUserTarget = (userId: string) => {
    setPermissionTarget({ type: 'user', id: userId })
  }

  // Selected role object
  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0] || {
      id: '',
      name: 'Sin Rol',
      description: '',
      permissions: DEFAULT_PERMISSIONS_EMPTY,
    }
  }, [roles, selectedRoleId])

  // Selected target user (if permissionTarget.type === 'user')
  const selectedTargetUser = useMemo(() => {
    if (permissionTarget.type !== 'user') return null
    return users.find((u) => u.id === permissionTarget.id) || null
  }, [users, permissionTarget])

  // Base role of the selected target
  const activeTargetRole = useMemo(() => {
    if (permissionTarget.type === 'user' && selectedTargetUser) {
      return roles.find((r) => r.id === selectedTargetUser.roleId) || roles[0]
    }
    return roles.find((r) => r.id === permissionTarget.id) || roles[0]
  }, [permissionTarget, selectedTargetUser, roles])

  // Active permissions for the Permissions Matrix (merging role + custom user overrides if any)
  const activePermissions = useMemo((): Record<ModuleId, ModulePermission> => {
    if (permissionTarget.type === 'user' && selectedTargetUser) {
      const baseRole = roles.find((r) => r.id === selectedTargetUser.roleId) || roles[0]
      const userCustom = selectedTargetUser.customPermissions || {}
      const combined: Record<ModuleId, ModulePermission> = { ...(baseRole?.permissions || DEFAULT_PERMISSIONS_EMPTY) }

      MODULES_INFO.forEach((mod) => {
        if (userCustom[mod.id]) {
          combined[mod.id] = { ...combined[mod.id], ...userCustom[mod.id] }
        }
      })

      return combined
    }

    const currentRole = roles.find((r) => r.id === permissionTarget.id) || roles[0]
    return currentRole?.permissions || DEFAULT_PERMISSIONS_EMPTY
  }, [permissionTarget, selectedTargetUser, roles])

  // Whether the selected target is a user with customized overrides
  const isUserTargetCustomized = useMemo(() => {
    if (permissionTarget.type !== 'user' || !selectedTargetUser) return false
    return !!selectedTargetUser.customPermissions && Object.keys(selectedTargetUser.customPermissions).length > 0
  }, [permissionTarget, selectedTargetUser])

  // Current active simulated role
  const currentSimulatedRole = useMemo(() => {
    return roles.find((r) => r.id === activeRoleSimulated) || roles[0]
  }, [roles, activeRoleSimulated])

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = filters.searchQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.roleName.toLowerCase().includes(query)

      const matchesRole =
        filters.roleFilter === 'all' ||
        user.roleId === filters.roleFilter ||
        user.roleName.toLowerCase() === filters.roleFilter.toLowerCase()

      const matchesStatus =
        filters.statusFilter === 'all' || user.status === filters.statusFilter

      return matchesQuery && matchesRole && matchesStatus
    })
  }, [users, filters])

  // Al cambiar de modo, ajusta el objetivo de permisos
  const setAccessMode = useCallback(
    (mode: 'usuarios' | 'roles') => {
      setActiveTab(mode)
      if (mode === 'roles') {
        const roleId = selectedRoleId || roles[0]?.id
        if (roleId) {
          setSelectedRoleId(roleId)
          setPermissionTarget({ type: 'role', id: roleId })
        }
        return
      }

      const firstUser = filteredUsers[0] || users[0]
      if (firstUser) {
        setPermissionTarget({ type: 'user', id: firstUser.id })
      }
    },
    [filteredUsers, roles, selectedRoleId, users]
  )

  // Selecciona automáticamente el primer usuario en modo "Por usuario"
  useEffect(() => {
    if (activeTab !== 'usuarios') return

    if (pendingSelectUserId) {
      const pendingUser = users.find((u) => u.id === pendingSelectUserId)
      if (pendingUser) {
        setPermissionTarget({ type: 'user', id: pendingUser.id })
        setPendingSelectUserId(null)
        return
      }
    }

    if (permissionTarget.type === 'user') {
      const stillVisible = filteredUsers.some((u) => u.id === permissionTarget.id)
      if (stillVisible) return
    }

    const firstUser = filteredUsers[0]
    if (firstUser) {
      setPermissionTarget({ type: 'user', id: firstUser.id })
    }
  }, [activeTab, filteredUsers, pendingSelectUserId, permissionTarget, users])

  // Permission Checker Methods
  const canView = (moduleId: ModuleId): boolean => {
    if (!currentSimulatedRole) return true
    return !!currentSimulatedRole.permissions[moduleId]?.view
  }

  const canCreate = (moduleId: ModuleId): boolean => {
    if (!currentSimulatedRole) return true
    return !!currentSimulatedRole.permissions[moduleId]?.create
  }

  const canEdit = (moduleId: ModuleId): boolean => {
    if (!currentSimulatedRole) return true
    return !!currentSimulatedRole.permissions[moduleId]?.edit
  }

  const canDelete = (moduleId: ModuleId): boolean => {
    if (!currentSimulatedRole) return true
    return !!currentSimulatedRole.permissions[moduleId]?.delete
  }

  // Toggle single permission for selected target (role or user)
  const togglePermission = (
    moduleId: ModuleId,
    permissionKey: keyof ModulePermission
  ) => {
    if (permissionTarget.type === 'user' && selectedTargetUser) {
      const currentCombined = activePermissions[moduleId] || {
        view: false,
        create: false,
        edit: false,
        delete: false,
      }

      const updatedModPerm = {
        ...currentCombined,
        [permissionKey]: !currentCombined[permissionKey],
      }

      if (permissionKey === 'view' && !updatedModPerm.view) {
        updatedModPerm.create = false
        updatedModPerm.edit = false
        updatedModPerm.delete = false
      }
      if (permissionKey !== 'view' && updatedModPerm[permissionKey]) {
        updatedModPerm.view = true
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id !== selectedTargetUser.id) return u
          return {
            ...u,
            customPermissions: {
              ...(u.customPermissions || {}),
              [moduleId]: updatedModPerm,
            },
          }
        })
      )
      return
    }

    // Toggle for role
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== permissionTarget.id) return role

        const currentModPerm = role.permissions[moduleId] || {
          view: false,
          create: false,
          edit: false,
          delete: false,
        }

        const updatedModPerm = {
          ...currentModPerm,
          [permissionKey]: !currentModPerm[permissionKey],
        }

        if (permissionKey === 'view' && !updatedModPerm.view) {
          updatedModPerm.create = false
          updatedModPerm.edit = false
          updatedModPerm.delete = false
        }

        if (permissionKey !== 'view' && updatedModPerm[permissionKey]) {
          updatedModPerm.view = true
        }

        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleId]: updatedModPerm,
          },
        }
      })
    )
  }

  // Save changes in Permissions Matrix to backend
  const saveRolePermissions = async () => {
    try {
      if (permissionTarget.type === 'user' && selectedTargetUser) {
        const userCustom = selectedTargetUser.customPermissions || {}

        // Persistir Inicio/Reportes en local (no hay MODULES Oracle para ellos)
        const uiOverrides: Partial<Record<ModuleId, ModulePermission>> = {}
        for (const modId of UI_SHELL_MODULE_IDS) {
          if (userCustom[modId]) uiOverrides[modId] = userCustom[modId]
        }
        if (Object.keys(uiOverrides).length > 0) {
          setUserUiShellOverrides(
            { id: selectedTargetUser.id, email: selectedTargetUser.email },
            uiOverrides,
          )
        }

        for (const mod of dbModules) {
          const norm = normalizeModuleName(mod.name)
          if (!norm || isUiShellModule(norm) || !userCustom[norm]) continue

          const perm = userCustom[norm]!
          const existing = rawUserPermissions.find(
            (p) => p.userId.toLowerCase() === selectedTargetUser.id.toLowerCase() && p.moduleId.toLowerCase() === mod.id.toLowerCase()
          )

          if (existing) {
            await apiUpdateUserPermission(existing.id, {
              canView: perm.view,
              canCreate: perm.create,
              canEdit: perm.edit,
              canDelete: perm.delete,
            })
          } else {
            await apiCreateUserPermission({
              userId: selectedTargetUser.id,
              moduleId: mod.id,
              canView: perm.view,
              canCreate: perm.create,
              canEdit: perm.edit,
              canDelete: perm.delete,
            })
          }
        }
        showToast(`Permisos personalizados para "${selectedTargetUser.name}" guardados correctamente`)
      } else {
        const currentRole = roles.find((r) => r.id === permissionTarget.id)
        if (currentRole) {
          const uiOverrides: Partial<Record<ModuleId, ModulePermission>> = {}
          for (const modId of UI_SHELL_MODULE_IDS) {
            if (currentRole.permissions[modId]) {
              uiOverrides[modId] = currentRole.permissions[modId]
            }
          }
          if (Object.keys(uiOverrides).length > 0) {
            setUiShellOverrides('role', currentRole.id, uiOverrides)
          }

          for (const mod of dbModules) {
            const norm = normalizeModuleName(mod.name)
            if (!norm || isUiShellModule(norm) || !currentRole.permissions[norm]) continue

            const perm = currentRole.permissions[norm]
            const existing = rawRolePermissions.find(
              (p) => p.roleId.toLowerCase() === currentRole.id.toLowerCase() && p.moduleId.toLowerCase() === mod.id.toLowerCase()
            )

            if (existing) {
              await apiUpdateRolePermission(existing.id, {
                canView: perm.view,
                canCreate: perm.create,
                canEdit: perm.edit,
                canDelete: perm.delete,
              })
            } else {
              await apiCreateRolePermission({
                roleId: currentRole.id,
                moduleId: mod.id,
                canView: perm.view,
                canCreate: perm.create,
                canEdit: perm.edit,
                canDelete: perm.delete,
              })
            }
          }
        }
        showToast(`Permisos para el rol "${selectedRole.name}" guardados correctamente`)
      }
      await loadData()
    } catch (err) {
      console.error('Error al guardar permisos', err)
      showToast('Error al persistir permisos en el servidor.')
    }
  }

  // Reset user custom permissions back to default role
  const resetUserPermissions = (userId?: string) => {
    const targetId = userId || selectedTargetUser?.id
    if (!targetId) return

    clearUserUiShellOverrides({
      id: targetId,
      email: users.find((u) => u.id === targetId)?.email,
    })

    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id !== targetId) return u
        const { customPermissions: _, ...rest } = u
        return rest
      })
    )

    const targetUser = users.find((u) => u.id === targetId)
    if (targetUser) {
      showToast(`Permisos de "${targetUser.name}" restablecidos a los del rol "${targetUser.roleName}"`)
    }
  }

  // Aplica Activo/Inactivo vía endpoints dedicados (PUT /Users no cambia isActive)
  const syncUserActiveStatus = async (userId: string, status: UserStatus) => {
    if (status === 'Inactivo') {
      await apiDeactivateUser(userId)
    } else {
      await apiActivateUser(userId)
    }
  }

  // User CRUD Actions
  const createUser = async (data: UserFormData): Promise<UserSaveResult> => {
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim()
      const email = data.email.trim()
      const result = await apiCreateFullUser({
        fullName,
        email,
        password: data.password || 'Huellitas2026!',
        roleId: data.roleId,
      })

      // createFullUser siempre deja la cuenta Activa; si eligieron Inactivo, desactivar
      if (data.status === 'Inactivo') {
        await syncUserActiveStatus(result.userId, 'Inactivo')
      }

      await loadData()
      setActiveTab('usuarios')
      setPendingSelectUserId(result.userId)
      setPermissionTarget({ type: 'user', id: result.userId })

      return { ok: true, email, mode: 'create' }
    } catch (err) {
      return { ok: false, error: extractUserApiErrorMessage(err) }
    }
  }

  const updateUser = async (userId: string, data: UserFormData): Promise<UserSaveResult> => {
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim()
      const email = data.email.trim()
      const current = users.find((u) => u.id === userId)

      await apiUpdateUser(userId, {
        fullName,
        email,
        roleId: data.roleId,
      })

      // El dropdown de estado del drawer debe persistir con activate/deactivate
      if (current?.status !== data.status) {
        await syncUserActiveStatus(userId, data.status)
      }

      await loadData()
      setEditingUser(null)

      return { ok: true, email, mode: 'edit' }
    } catch (err) {
      return { ok: false, error: extractUserApiErrorMessage(err) }
    }
  }

  const deleteUser = (_userId: string) => {
    showToast('La eliminación física de usuarios está restringida. Use desactivar cuenta.')
  }

  const toggleUserStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    try {
      const nextStatus: UserStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo'
      await syncUserActiveStatus(userId, nextStatus)
      showToast(
        nextStatus === 'Inactivo'
          ? `Usuario "${user.name}" desactivado`
          : `Usuario "${user.name}" activado`,
      )
      await loadData()
    } catch (err) {
      showToast(extractUserApiErrorMessage(err))
    }
  }

  // Role CRUD Actions
  const createRole = async (data: { name: string; description: string; baseRoleId?: string }) => {
    try {
      const res = await apiCreateRole({
        name: data.name,
        description: data.description,
      })

      await loadData()
      setActiveTab('roles')
      setSelectedRoleId(res.id)
      setPermissionTarget({ type: 'role', id: res.id })
      setIsRoleModalOpen(false)
      showToast(`Rol "${data.name}" creado con éxito en la base de datos`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear rol'
      showToast(msg)
    }
  }

  // Modal handlers
  const openCreateUserModal = () => {
    setEditingUser(null)
    setIsUserModalOpen(true)
  }

  const openEditUserModal = (user: SystemUser) => {
    setEditingUser(user)
    setIsUserModalOpen(true)
  }

  const closeUserModal = () => {
    setIsUserModalOpen(false)
    setEditingUser(null)
  }

  const openCreateRoleModal = () => {
    setIsRoleModalOpen(true)
  }

  const closeRoleModal = () => {
    setIsRoleModalOpen(false)
  }

  return {
    users,
    roles,
    isLoading,
    permissionTarget,
    selectRoleTarget,
    selectUserTarget,
    selectedRole,
    selectedRoleId,
    setSelectedRoleId,
    selectedTargetUser,
    activeTargetRole,
    activePermissions,
    isUserTargetCustomized,
    resetUserPermissions,
    activeRoleSimulated,
    setActiveRoleSimulated,
    currentSimulatedRole,
    activeTab,
    setActiveTab,
    setAccessMode,
    filters,
    setFilters,
    filteredUsers,
    modulesInfo: MODULES_INFO,
    activeNotification,
    showToast,
    loadData,
    // Permissions checkers
    canView,
    canCreate,
    canEdit,
    canDelete,
    togglePermission,
    saveRolePermissions,
    // User CRUD
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    // Role CRUD
    createRole,
    // Modals
    isUserModalOpen,
    editingUser,
    openCreateUserModal,
    openEditUserModal,
    closeUserModal,
    isRoleModalOpen,
    openCreateRoleModal,
    closeRoleModal,
  }
}
