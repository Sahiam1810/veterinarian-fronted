import { useState, useMemo } from 'react'
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
} from '../types'



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

const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Acceso total',
    isSystem: true,
    permissions: {
      ...DEFAULT_PERMISSIONS_ALL,
    },
  },
  {
    id: 'veterinario',
    name: 'Veterinario',
    description: 'Gestión médica',
    isSystem: true,
    permissions: {
      inicio: { view: true, create: false, edit: false, delete: false },
      usuarios: { view: false, create: false, edit: false, delete: false },
      duenos: { view: true, create: true, edit: true, delete: false },
      mascotas: { view: true, create: true, edit: true, delete: false },
      servicios: { view: true, create: false, edit: false, delete: false },
      profesionales: { view: true, create: false, edit: false, delete: false },
      disponibilidad: { view: true, create: true, edit: true, delete: false },
      agenda: { view: true, create: true, edit: true, delete: false },
      historiaClinica: { view: true, create: true, edit: true, delete: false },
      reportes: { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    id: 'recepcionista',
    name: 'Recepcionista',
    description: 'Gestión de citas y clientes',
    isSystem: true,
    permissions: {
      inicio: { view: true, create: false, edit: false, delete: false },
      usuarios: { view: false, create: false, edit: false, delete: false },
      duenos: { view: true, create: true, edit: true, delete: false },
      mascotas: { view: true, create: true, edit: true, delete: false },
      servicios: { view: true, create: false, edit: false, delete: false },
      profesionales: { view: true, create: false, edit: false, delete: false },
      disponibilidad: { view: true, create: false, edit: false, delete: false },
      agenda: { view: true, create: true, edit: true, delete: true },
      historiaClinica: { view: false, create: false, edit: false, delete: false },
      reportes: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: 'auxiliar',
    name: 'Auxiliar',
    description: 'Soporte clínico',
    isSystem: true,
    permissions: {
      inicio: { view: true, create: false, edit: false, delete: false },
      usuarios: { view: false, create: false, edit: false, delete: false },
      duenos: { view: false, create: false, edit: false, delete: false },
      mascotas: { view: true, create: false, edit: true, delete: false },
      servicios: { view: true, create: false, edit: false, delete: false },
      profesionales: { view: false, create: false, edit: false, delete: false },
      disponibilidad: { view: false, create: false, edit: false, delete: false },
      agenda: { view: true, create: false, edit: false, delete: false },
      historiaClinica: { view: true, create: true, edit: false, delete: false },
      reportes: { view: false, create: false, edit: false, delete: false },
    },
  },
]

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr-1',
    name: 'Dra. Ana Silva',
    email: 'ana.silva@vetclinic.com',
    roleId: 'veterinario',
    roleName: 'Veterinario',
    status: 'Activo',
    registrationDate: '12 Oct 2023',
  },
  {
    id: 'usr-2',
    name: 'Carlos Méndez',
    email: 'carlos.mendez@vetclinic.com',
    roleId: 'recepcionista',
    roleName: 'Recepcionista',
    status: 'Activo',
    registrationDate: '05 Nov 2023',
  },
  {
    id: 'usr-3',
    name: 'Laura Gómez',
    email: 'laura.gomez@vetclinic.com',
    roleId: 'auxiliar',
    roleName: 'Auxiliar',
    status: 'Inactivo',
    registrationDate: '20 Sep 2023',
  },
  {
    id: 'usr-4',
    name: 'Dr. Mario Ramírez',
    email: 'mario.ramirez@vetclinic.com',
    roleId: 'admin',
    roleName: 'Administrador',
    status: 'Activo',
    registrationDate: '15 Ene 2023',
  },
]

export function useUserAdmin() {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS)
  const [roles, setRoles] = useState<RoleDefinition[]>(INITIAL_ROLES)
  const [permissionTarget, setPermissionTarget] = useState<PermissionTarget>({
    type: 'role',
    id: 'admin',
  })
  const [selectedRoleId, setSelectedRoleId] = useState<string>('admin')
  const [activeRoleSimulated, setActiveRoleSimulated] = useState<string>('admin')
  const [activeTab, setActiveTab] = useState<'usuarios' | 'roles'>('usuarios')
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

  const showToast = (message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((current) => (current === message ? null : current))
    }, 3000)
  }

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
    return roles.find((r) => r.id === selectedRoleId) || roles[0]
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
      const combined: Record<ModuleId, ModulePermission> = { ...baseRole.permissions }

      MODULES_INFO.forEach((mod) => {
        if (userCustom[mod.id]) {
          combined[mod.id] = { ...combined[mod.id], ...userCustom[mod.id] }
        }
      })

      return combined
    }

    const currentRole = roles.find((r) => r.id === permissionTarget.id) || roles[0]
    return currentRole.permissions
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
      // Toggle custom permission for user
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

  // Save changes in Permissions Matrix
  const saveRolePermissions = () => {
    if (permissionTarget.type === 'user' && selectedTargetUser) {
      showToast(`Permisos personalizados para "${selectedTargetUser.name}" guardados correctamente`)
    } else {
      showToast(`Permisos para el rol "${selectedRole.name}" guardados correctamente`)
    }
  }

  // Reset user custom permissions back to default role
  const resetUserPermissions = (userId?: string) => {
    const targetId = userId || selectedTargetUser?.id
    if (!targetId) return

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


  // User CRUD Actions
  const createUser = (data: UserFormData) => {
    const role = roles.find((r) => r.id === data.roleId)
    const roleName = role ? role.name : 'Usuario'
    const fullName = `${data.firstName} ${data.lastName}`.trim()

    const newUser: SystemUser = {
      id: `usr-${Date.now()}`,
      name: fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      roleId: data.roleId,
      roleName,
      status: data.status,
      registrationDate: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    }

    setUsers((prev) => [newUser, ...prev])
    setIsUserModalOpen(false)
    showToast(`Usuario "${newUser.name}" creado con éxito`)
  }

  const updateUser = (userId: string, data: UserFormData) => {
    const role = roles.find((r) => r.id === data.roleId)
    const roleName = role ? role.name : 'Usuario'
    const fullName = `${data.firstName} ${data.lastName}`.trim()

    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              name: fullName,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              password: data.password || user.password,
              roleId: data.roleId,
              roleName,
              status: data.status,
            }
          : user
      )
    )
    setIsUserModalOpen(false)
    setEditingUser(null)
    showToast(`Usuario "${fullName}" actualizado con éxito`)
  }


  const deleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    showToast(`Usuario "${user?.name || ''}" eliminado`)
  }

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const newStatus: UserStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo'
          showToast(`Estado de "${user.name}" cambiado a ${newStatus}`)
          return { ...user, status: newStatus }
        }
        return user
      })
    )
  }

  // Role CRUD Actions
  const createRole = (data: { name: string; description: string; baseRoleId?: string }) => {
    const baseRole = roles.find((r) => r.id === data.baseRoleId)
    const basePermissions = baseRole ? { ...baseRole.permissions } : { ...DEFAULT_PERMISSIONS_ALL }

    const newRole: RoleDefinition = {
      id: `role-${Date.now()}`,
      name: data.name,
      description: data.description,
      isSystem: false,
      permissions: basePermissions,
    }

    setRoles((prev) => [...prev, newRole])
    setSelectedRoleId(newRole.id)
    setIsRoleModalOpen(false)
    showToast(`Rol "${newRole.name}" creado con éxito`)
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
    filters,
    setFilters,
    filteredUsers,
    modulesInfo: MODULES_INFO,
    activeNotification,
    showToast,
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
