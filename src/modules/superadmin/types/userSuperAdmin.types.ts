export type ModuleId =
  | 'inicio'
  | 'usuarios'
  | 'duenos'
  | 'mascotas'
  | 'especiesRazas'
  | 'servicios'
  | 'profesionales'
  | 'disponibilidad'
  | 'agenda'
  | 'historiaClinica'
  | 'reportes'

export interface ModulePermission {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

export interface ModuleInfo {
  id: ModuleId
  label: string
  description?: string
  supportsCreate?: boolean
  supportsEdit?: boolean
  supportsDelete?: boolean
}

export interface RoleDefinition {
  id: string
  name: string
  description: string
  isSystem?: boolean
  permissions: Record<ModuleId, ModulePermission>
}

export type UserStatus = 'Activo' | 'Inactivo'

export type PermissionTargetType = 'role' | 'user'

export interface PermissionTarget {
  type: PermissionTargetType
  id: string
}

export interface SystemUser {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  password?: string
  roleId: string
  roleName: string
  status: UserStatus
  registrationDate: string
  avatarUrl?: string
  // Cuenta de login en USER_ACCOUNTS; vacía en dueños sin panel.
  accountId?: string
  customPermissions?: Partial<Record<ModuleId, ModulePermission>>
}

export interface UserFormData {
  firstName: string
  lastName: string
  email: string
  password?: string
  // Teléfono: sesión del Cliente vía Telegram (sin login web)
  phoneNumber?: string
  roleId: string
  status: UserStatus
  // Obligatorios cuando el rol es Veterinario
  specialtyId?: string
  licenseNumber?: string
}

export interface UserFilters {
  searchQuery: string
  roleFilter: string
  statusFilter: string
}

export type UserSaveResult =
  | { ok: true; email: string; mode: 'create' | 'edit' }
  | { ok: false; error: string }


