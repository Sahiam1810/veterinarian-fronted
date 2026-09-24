import { useState, useMemo, useEffect, useCallback } from 'react'
import type {
  SystemUser,
  RoleDefinition,
  ModuleId,
  ModulePermission,
  UserFilters,
  UserStatus,
  UserFormData,
  PermissionTarget,
  UserSaveResult,
} from '../types'
import { extractUserApiErrorMessage } from '../utils/translateUserApiError'
import { normalizeModuleName } from '../utils/normalizeModuleName'
import {
  fetchUsers,
  deleteUser as apiDeleteUser,
  createFullUser as apiCreateFullUser,
  updateUser as apiUpdateUser,
  activateUser as apiActivateUser,
  deactivateUser as apiDeactivateUser,
  type ApiUserResponse,
} from '../services/superAdminUserService'
import {
  fetchSpecialties,
  createVeterinarian,
  updateVeterinarian,
  fetchVeterinarians,
  createAvailability,
} from '../services'
import { createDefaultVeterinarianSchedule } from '../utils/defaultVeterinarianSchedule'
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
  type ApiRolePermissionResponse,
} from '../services/superAdminPermissionsService'
import { API_BASE_URL } from '@/config'
import { ApiError } from '@/services'
import {
  clearDeprecatedUiShellOverrides,
} from '../utils/uiShellPermissionsStorage'
import { MODULES_INFO } from '../utils/superAdminNavCatalog'
export { MODULES_INFO } from '../utils/superAdminNavCatalog'


const DEFAULT_PERMISSIONS_ALL: Record<ModuleId, ModulePermission> = {
  inicio: { view: true, create: true, edit: true, delete: true },
  usuarios: { view: true, create: true, edit: true, delete: true },
  duenos: { view: true, create: true, edit: true, delete: true },
  mascotas: { view: true, create: true, edit: true, delete: true },
  especiesRazas: { view: true, create: true, edit: true, delete: true },
  servicios: { view: true, create: true, edit: true, delete: true },
  profesionales: { view: true, create: true, edit: true, delete: true },
  ordenesMedicas: { view: true, create: true, edit: true, delete: true },
  insumos: { view: true, create: true, edit: true, delete: true },
  hospitalizacion: { view: true, create: true, edit: true, delete: true },
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
  especiesRazas: { view: false, create: false, edit: false, delete: false },
  servicios: { view: false, create: false, edit: false, delete: false },
  profesionales: { view: false, create: false, edit: false, delete: false },
  ordenesMedicas: { view: false, create: false, edit: false, delete: false },
  insumos: { view: false, create: false, edit: false, delete: false },
  hospitalizacion: { view: false, create: false, edit: false, delete: false },
  disponibilidad: { view: false, create: false, edit: false, delete: false },
  agenda: { view: false, create: false, edit: false, delete: false },
  historiaClinica: { view: false, create: false, edit: false, delete: false },
  reportes: { view: false, create: false, edit: false, delete: false },
}

// Rol vacío seguro cuando /api/Roles responde 403 o la lista aún no cargó
const EMPTY_ROLE: RoleDefinition = {
  id: '',
  name: 'Sin rol',
  description: 'Sin descripción',
  permissions: DEFAULT_PERMISSIONS_EMPTY,
}

export { normalizeModuleName } from '../utils/normalizeModuleName'

// SuperAdmin es un rol de sistema persistido y no se ofrece como rol administrable.
export function isPlatformSuperAdminRoleName(name: string): boolean {
  const n = name.trim().toLowerCase()
  return n.includes('superadmin') || n.includes('super admin')
}

export function isProtectedSuperAdminUser(user: Pick<SystemUser, 'roleName'>): boolean {
  return isPlatformSuperAdminRoleName(user.roleName)
}

// Veterinario: requiere especialidad y tarjeta profesional (CMP)
export function isVeterinarioRoleName(name: string): boolean {
  const n = name.trim().toLowerCase()
  return n.includes('veterinar')
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

export function useUserSuperAdmin(options?: { canManagePermissions?: boolean }) {
  // Solo SuperAdmin de plataforma carga matriz de permisos (Modules / ROLE_PERMISSIONS)
  const canManagePermissions = options?.canManagePermissions ?? true

  const [users, setUsers] = useState<SystemUser[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([])
  // Perfil vet por userId (para editar CMP/especialidad)
  const [vetProfileByUserId, setVetProfileByUserId] = useState<
    Record<string, { id: string; specialtyId: string; licenseNumber: string }>
  >({})
  const [dbModules, setDbModules] = useState<ApiModuleResponse[]>([])
  const [rawRolePermissions, setRawRolePermissions] = useState<ApiRolePermissionResponse[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [permissionTarget, setPermissionTarget] = useState<PermissionTarget>({
    type: 'role',
    id: '',
  })
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [activeRoleSimulated, setActiveRoleSimulated] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'usuarios' | 'roles'>('usuarios')
  const [pendingSelectUserId, setPendingSelectUserId] = useState<string | null>(null)
  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const [toastTone, setToastTone] = useState<'success' | 'warning'>('success')

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

  const showToast = useCallback((message: string, tone: 'success' | 'warning' = 'success') => {
    setToastTone(tone)
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((current) => (current === message ? null : current))
    }, 4200)
  }, [])

  // Cargar datos reales desde el backend
  const loadData = useCallback(async () => {
    clearDeprecatedUiShellOverrides()
    setIsLoading(true)
    setLoadError(null)
    try {
      // Sin canManagePermissions no pedimos Modules / ROLE_PERMISSIONS
      // (403 ruidosos en consola para Auxiliar/Admin sin Plataforma).
      const [usersRes, rolesRes, modulesRes, rolePermsRes, specialtiesRes, vetsRes] =
        await Promise.allSettled([
          fetchUsers(),
          fetchRoles(),
          canManagePermissions ? fetchModules() : Promise.resolve([] as ApiModuleResponse[]),
          canManagePermissions
            ? fetchAllRolePermissions()
            : Promise.resolve([] as ApiRolePermissionResponse[]),
          fetchSpecialties(),
          fetchVeterinarians(),
        ])

      const isExpectedForbidden = (r: PromiseSettledResult<unknown>): boolean =>
        r.status === 'rejected' && r.reason instanceof ApiError && r.reason.status === 403

      // 403 esperados fuera de SuperAdmin / Roles / Plataforma / Veterinarios:
      // no deben mostrarse como error de carga de la pantalla Usuarios.
      const concerning = [rolesRes, modulesRes, rolePermsRes, vetsRes, specialtiesRes].filter(
        (r): r is PromiseRejectedResult => r.status === 'rejected' && !isExpectedForbidden(r),
      )

      if (usersRes.status === 'rejected') {
        const first = usersRes.reason
        const status = first instanceof ApiError ? first.status : 0
        const msg =
          status === 401
            ? 'Sesión expirada. Cierra sesión e inicia de nuevo.'
            : status === 403
              ? 'No tienes permiso para ver usuarios.'
              : first instanceof Error
                ? first.message === 'Forbidden'
                  ? 'No tienes permiso para ver usuarios.'
                  : first.message
                : `No se pudo contactar al API (¿está disponible en ${API_BASE_URL}?).`
        setLoadError(msg)
        showToast(msg, 'warning')
      } else if (concerning.length > 0) {
        const first = concerning[0].reason
        const status = first instanceof ApiError ? first.status : 0
        if (status === 401) {
          showToast('Sesión expirada. Cierra sesión e inicia de nuevo.', 'warning')
        } else {
          const raw = first instanceof Error ? first.message : 'No se pudieron cargar usuarios y roles.'
          const msg = raw === 'Forbidden' ? 'No tienes permisos para parte de esta pantalla.' : raw
          showToast(msg, 'warning')
        }
      }

      let fetchedRoles: ApiRoleResponse[] = rolesRes.status === 'fulfilled' ? rolesRes.value : []
      const fetchedModules: ApiModuleResponse[] = modulesRes.status === 'fulfilled' ? modulesRes.value : []
      const fetchedRolePerms: ApiRolePermissionResponse[] = rolePermsRes.status === 'fulfilled' ? rolePermsRes.value : []
      const fetchedUsers: ApiUserResponse[] = usersRes.status === 'fulfilled' ? usersRes.value : []

      const fetchedSpecialties =
        specialtiesRes.status === 'fulfilled' ? specialtiesRes.value : []
      setSpecialties(fetchedSpecialties.map((s) => ({ id: s.id, name: s.name })))

      const fetchedVets = vetsRes.status === 'fulfilled' ? vetsRes.value : []
      const vetMap: Record<string, { id: string; specialtyId: string; licenseNumber: string }> = {}
      for (const vet of fetchedVets) {
        vetMap[vet.userId.toLowerCase()] = {
          id: vet.id,
          specialtyId: vet.specialtyId,
          licenseNumber: vet.licenseNumber,
        }
      }
      setVetProfileByUserId(vetMap)

      setDbModules(fetchedModules)
      setRawRolePermissions(fetchedRolePerms)

      // Módulo ID a ModuleId
      const moduleMap = new Map<string, ModuleId>()
      fetchedModules.forEach((m) => {
        const normalized = normalizeModuleName(m.name)
        if (normalized) {
          moduleMap.set(m.id.toLowerCase(), normalized)
        }
      })

      // Mapear Roles
      let mappedRoles: RoleDefinition[] = fetchedRoles.map((r) => {
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

        return {
          id: r.id,
          name: r.name,
          description: r.description || 'Sin descripción',
          isSystem: isPlatformSuper,
          permissions: perms,
        }
      })

      // Si /api/Roles falló (403) pero hay usuarios, crear stubs para no romper la ficha
      if (mappedRoles.length === 0 && fetchedUsers.length > 0) {
        const seen = new Set<string>()
        mappedRoles = fetchedUsers
          .filter((u) => {
            const key = u.roleId.toLowerCase()
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
          .map((u) => ({
            id: u.roleId,
            name: 'Usuario',
            description: 'Descripción no disponible (sin permiso de Roles).',
            isSystem: false,
            permissions: { ...DEFAULT_PERMISSIONS_EMPTY },
          }))
      }

      // Mapear Usuarios
      const rolesMap = new Map<string, string>()
      mappedRoles.forEach((r) => rolesMap.set(r.id.toLowerCase(), r.name))

      const mappedUsers: SystemUser[] = fetchedUsers.map((u) => {
        const roleName = rolesMap.get(u.roleId.toLowerCase()) || 'Usuario'
        const parts = u.fullName.trim().split(' ')
        const firstName = parts[0] || ''
        const lastName = parts.slice(1).join(' ') || ''

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
        }
      })

      setRoles(mappedRoles)
      setUsers(mappedUsers)

      // No resetear el objetivo de permisos en cada recarga (evita que se "remarquen" solos)
      const firstAssignable =
        mappedRoles.find((r) => !r.isSystem) ||
        mappedRoles[0]
      setSelectedRoleId((prev) => {
        if (prev) {
          const current = mappedRoles.find((r) => r.id === prev)
          if (current && !current.isSystem) {
            return prev
          }
        }
        return firstAssignable?.id || ''
      })
      setActiveRoleSimulated((prev) => {
        if (prev) {
          const current = mappedRoles.find((r) => r.id === prev)
          if (current && !current.isSystem) {
            return prev
          }
        }
        return firstAssignable?.id || ''
      })
      setPermissionTarget((prev) => {
        if (prev.id) {
          const current = mappedRoles.find((r) => r.id === prev.id)
          if (current && !current.isSystem) {
            return prev
          }
        }
        if (firstAssignable) return { type: 'role', id: firstAssignable.id }
        return prev
      })
    } catch (err) {
      console.error('Error al cargar datos de usuarios y roles', err)
      showToast('Error al conectar con la base de datos.', 'warning')
    } finally {
      setIsLoading(false)
    }
  }, [canManagePermissions, showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // Target switcher helpers
  const selectRoleTarget = (roleId: string) => {
    setSelectedRoleId(roleId)
    setPermissionTarget({ type: 'role', id: roleId })
  }

  const selectUserTarget = (userId: string) => {
    setSelectedUserId(userId)
  }

  // Selected role object
  const selectedRole = useMemo(() => {
    const validRoles = roles.filter((r) => !r.isSystem)
    return validRoles.find((r) => r.id === selectedRoleId) || validRoles[0] || roles[0] || EMPTY_ROLE
  }, [roles, selectedRoleId])

  // Selected target user
  const selectedTargetUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) || users[0] || null
  }, [users, selectedUserId])

  // Base role of the selected target (nunca undefined: evita crash en UserInfoCard)
  const activeTargetRole = useMemo((): RoleDefinition => {
    if (selectedTargetUser) {
      return (
        roles.find((r) => r.id === selectedTargetUser.roleId) ||
        roles[0] || {
          ...EMPTY_ROLE,
          id: selectedTargetUser.roleId,
          name: selectedTargetUser.roleName || 'Usuario',
          description: 'Descripción no disponible (sin permiso de Roles).',
        }
      )
    }
    return roles.find((r) => r.id === permissionTarget.id) || roles[0] || EMPTY_ROLE
  }, [permissionTarget.id, selectedTargetUser, roles])

  // Active permissions for the Permissions Matrix (role permissions)
  const activePermissions = useMemo((): Record<ModuleId, ModulePermission> => {
    const currentRole = roles.find((r) => r.id === permissionTarget.id) || roles[0]
    return currentRole?.permissions || DEFAULT_PERMISSIONS_EMPTY
  }, [permissionTarget, roles])

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

  // Al cambiar de modo, ajusta el objetivo de permisos o usuario activo
  const setAccessMode = useCallback(
    (mode: 'usuarios' | 'roles') => {
      setActiveTab(mode)
      if (mode === 'roles') {
        const assignable =
          roles.find((r) => !r.isSystem && r.id === selectedRoleId) ||
          roles.find((r) => !r.isSystem)
        const roleId = assignable?.id
        if (roleId) {
          setSelectedRoleId(roleId)
          setPermissionTarget({ type: 'role', id: roleId })
        }
        return
      }

      const firstUser = filteredUsers[0] || users[0]
      if (firstUser) {
        setSelectedUserId(firstUser.id)
      }
    },
    [filteredUsers, roles, selectedRoleId, users]
  )

  // Selecciona automáticamente el primer usuario en modo "usuarios"
  useEffect(() => {
    if (activeTab !== 'usuarios') return

    if (pendingSelectUserId) {
      const pendingUser = users.find((u) => u.id === pendingSelectUserId)
      if (pendingUser) {
        setSelectedUserId(pendingUser.id)
        setPendingSelectUserId(null)
        return
      }
    }

    if (selectedUserId) {
      const stillVisible = filteredUsers.some((u) => u.id === selectedUserId)
      if (stillVisible) return
    }

    const firstUser = filteredUsers[0]
    if (firstUser) {
      setSelectedUserId(firstUser.id)
    }
  }, [activeTab, filteredUsers, pendingSelectUserId, selectedUserId, users])

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

  // Toggle single permission for selected role
  const togglePermission = (
    moduleId: ModuleId,
    permissionKey: keyof ModulePermission
  ) => {
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
      const currentRole = roles.find((r) => r.id === permissionTarget.id)
      if (currentRole?.isSystem || (currentRole && isPlatformSuperAdminRoleName(currentRole.name))) {
        showToast('El rol SuperAdmin no se puede modificar.', 'warning')
        return
      }
      if (currentRole) {
        for (const mod of dbModules) {
          const norm = normalizeModuleName(mod.name)
          if (!norm || !currentRole.permissions[norm]) continue

          const perm = currentRole.permissions[norm]
          const existing = rawRolePermissions.find(
            (p) => p.roleId.toLowerCase() === currentRole.id.toLowerCase() && p.moduleId.toLowerCase() === mod.id.toLowerCase()
          )

          const existingPerm = existing
            ? { view: existing.canView, create: existing.canCreate, edit: existing.canEdit, delete: existing.canDelete }
            : { view: false, create: false, edit: false, delete: false }

          const hasChanged =
            perm.view !== existingPerm.view ||
            perm.create !== existingPerm.create ||
            perm.edit !== existingPerm.edit ||
            perm.delete !== existingPerm.delete

          if (!hasChanged) continue

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
      showToast(
        `Permisos del rol "${selectedRole.name}" guardados. Los cambios aplican cuando el usuario cierre sesión y vuelva a ingresar.`,
        'warning',
      )
      await loadData()
    } catch (err) {
      console.error('Error al guardar permisos', err)
      showToast('Error al persistir permisos en el servidor.')
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
      const roleName = roles.find((r) => r.id === data.roleId)?.name || ''
      if (isPlatformSuperAdminRoleName(roleName)) {
        return { ok: false, error: 'El rol SuperAdmin no se puede asignar desde este panel.' }
      }

      const fullName = `${data.firstName} ${data.lastName}`.trim()

      let vetSpecialtyId: string | undefined
      let vetLicenseNumber: string | undefined
      if (isVeterinarioRoleName(roleName)) {
        vetSpecialtyId = data.specialtyId?.trim() || specialties[0]?.id || ''
        vetLicenseNumber = data.licenseNumber?.trim() || ''
        if (!vetSpecialtyId) {
          return {
            ok: false,
            error: 'No hay especialidades configuradas. Configúralas antes de registrar un veterinario.',
          }
        }
        if (!vetLicenseNumber) {
          return {
            ok: false,
            error: 'La tarjeta profesional (CMP) es obligatoria para veterinarios.',
          }
        }
      }

      const email = data.email.trim()
      const result = await apiCreateFullUser({
        fullName,
        email,
        password: data.password ?? '',
        roleId: data.roleId,
        specialtyId: vetSpecialtyId,
        licenseNumber: vetLicenseNumber,
      })

      // createFullUser siempre deja la cuenta Activa; si eligieron Inactivo, desactivar
      if (data.status === 'Inactivo') {
        await syncUserActiveStatus(result.userId, 'Inactivo')
      }

      // S35: horario por defecto solo al crear el profesional, una sola vez.
      if (isVeterinarioRoleName(roleName)) {
        const vets = await fetchVeterinarians()
        const created = vets.find((v) => v.userId.toLowerCase() === result.userId.toLowerCase())
        if (created) {
          await createDefaultVeterinarianSchedule(created.id, createAvailability)
        }
      }

      await loadData()
      setActiveTab('usuarios')
      setPendingSelectUserId(result.userId)
      setSelectedUserId(result.userId)

      return { ok: true, email, mode: 'create' }
    } catch (err) {
      return { ok: false, error: extractUserApiErrorMessage(err) }
    }
  }

  const updateUser = async (userId: string, data: UserFormData): Promise<UserSaveResult> => {
    try {
      const current = users.find((u) => u.id === userId)
      if (current && isProtectedSuperAdminUser(current)) {
        return { ok: false, error: 'La cuenta SuperAdmin no se puede editar.' }
      }
      if (isPlatformSuperAdminRoleName(
        roles.find((r) => r.id === data.roleId)?.name || '',
      )) {
        return { ok: false, error: 'El rol SuperAdmin no se puede asignar desde este panel.' }
      }
      const fullName = `${data.firstName} ${data.lastName}`.trim()
      const email = data.email.trim()

      await apiUpdateUser(userId, {
        fullName,
        email,
        roleId: data.roleId,
      })

      // El dropdown de estado del drawer debe persistir con activate/deactivate
      if (current?.status !== data.status) {
        await syncUserActiveStatus(userId, data.status)
      }

      const roleName = roles.find((r) => r.id === data.roleId)?.name || ''
      if (isVeterinarioRoleName(roleName)) {
        const specialtyId = data.specialtyId?.trim() || specialties[0]?.id || ''
        const licenseNumber = data.licenseNumber?.trim() || ''
        if (!specialtyId || !licenseNumber) {
          return {
            ok: false,
            error: 'Especialidad y tarjeta profesional (CMP) son obligatorias para veterinarios.',
          }
        }
        const existing = vetProfileByUserId[userId.toLowerCase()]
        if (existing) {
          await updateVeterinarian(existing.id, {
            userId,
            specialtyId,
            licenseNumber,
          })
        } else {
          await createVeterinarian({
            userId,
            specialtyId,
            licenseNumber,
          })
        }
      }

      await loadData()
      setEditingUser(null)

      return { ok: true, email, mode: 'edit' }
    } catch (err) {
      return { ok: false, error: extractUserApiErrorMessage(err) }
    }
  }

  const deleteUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    if (isProtectedSuperAdminUser(user)) {
      showToast('La cuenta SuperAdmin no se puede eliminar ni modificar.', 'warning')
      return
    }

    if (user.status !== 'Inactivo') {
      showToast('Desactiva la cuenta antes de eliminarla.', 'warning')
      return
    }

    try {
      await apiDeleteUser(user.id)
      showToast(`Usuario "${user.name}" eliminado.`)
      await loadData()
    } catch (err) {
      showToast(extractUserApiErrorMessage(err), 'warning')
    }
  }

  const toggleUserStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    if (isProtectedSuperAdminUser(user)) {
      showToast('La cuenta SuperAdmin no se puede activar ni desactivar.', 'warning')
      return
    }

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
      showToast(extractUserApiErrorMessage(err), 'warning')
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
    if (isProtectedSuperAdminUser(user)) {
      showToast('La cuenta SuperAdmin no se puede editar.', 'warning')
      return
    }
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
    specialties,
    vetProfileByUserId,
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
    activeRoleSimulated,
    setActiveRoleSimulated,
    currentSimulatedRole,
    activeTab,
    setActiveTab,
    setAccessMode,
    filters,
    setFilters,
    filteredUsers,
    loadError,
    modulesInfo: MODULES_INFO,
    activeNotification,
    toastTone,
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
