import { useState, useEffect, type FormEvent } from 'react'
import {
  SuperAdminHeader,
  SuperAdminSidebar,
  DashboardBackgroundDecoration,
} from '../../components'
import { useUserSuperAdmin } from '../../hooks'
import type {
  SystemUser,
  RoleDefinition,
  UserStatus,
  UserFormData,
  UserFilters,
  ModuleInfo,
  ModulePermission,
  ModuleId,
  PermissionTarget,
  UserSaveResult,
  NotificacionSuperAdmin,
} from '../../types'

import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
} from '@/global/components'

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function hasCustomPermissions(user: SystemUser): boolean {
  return !!user.customPermissions && Object.keys(user.customPermissions).length > 0
}




/* ============================================================================
   1. DRAWER / PANEL LATERAL: NUEVO / EDITAR USUARIO
   ============================================================================ */
interface UserDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: UserFormData) => Promise<UserSaveResult>
  onSuccess: (payload: { email: string; mode: 'create' | 'edit' }) => void
  editingUser: SystemUser | null
  roles: RoleDefinition[]
}

function UserDrawer({
  isOpen,
  onClose,
  onSave,
  onSuccess,
  editingUser,
  roles,
}: UserDrawerProps) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [roleId, setRoleId] = useState('superadmin')
  const [status, setStatus] = useState<UserStatus>('Activo')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      if (editingUser) {
        const parts = (editingUser.name || '').trim().split(' ')
        setFirstName(editingUser.firstName || parts[0] || '')
        setLastName(editingUser.lastName || parts.slice(1).join(' ') || '')
        setEmail(editingUser.email || '')
        setPassword(editingUser.password || '')
        setRoleId(editingUser.roleId || roles[0]?.id || 'superadmin')
        setStatus(editingUser.status || 'Activo')
      } else {
        setFirstName('')
        setLastName('')
        setEmail('')
        setPassword('')
        setRoleId(roles[0]?.id || '')
        setStatus('Activo')
      }
      setShowPassword(false)
      setFormError(null)
      setIsSubmitting(false)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [editingUser, isOpen, roles])

  const handleClose = () => {
    if (isClosing || isSubmitting) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsRendered(false)
      setIsClosing(false)
    }, 230)
  }

  const handleCloseWithSuccess = (payload: { email: string; mode: 'create' | 'edit' }) => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      onSuccess(payload)
      setIsRendered(false)
      setIsClosing(false)
      setIsSubmitting(false)
    }, 230)
  }

  if (!isRendered && !isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!firstName.trim()) {
      setFormError('Por favor ingresa el nombre del usuario.')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError('Por favor ingresa un correo electrónico válido.')
      return
    }

    if (!editingUser && !password.trim()) {
      setFormError('Por favor asigna una contraseña inicial para el usuario.')
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    const result = await onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password.trim() || undefined,
      roleId,
      status,
    })

    if (!result.ok) {
      setFormError(result.error)
      setIsSubmitting(false)
      return
    }

    handleCloseWithSuccess({ email: result.email, mode: result.mode })
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-user-title"
      aria-busy={isSubmitting}
    >
      <div
        className={`w-full sm:w-[420px] lg:w-[450px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white">
          <h2
            id="drawer-user-title"
            className="text-xl sm:text-2xl font-bold text-brand tracking-tight"
          >
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
            aria-label="Cerrar panel"
          >
            <span className="text-xl font-medium leading-none">✕</span>
          </button>
        </div>

        {/* Formulario con scroll independiente */}
        <form
          id="user-drawer-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5"
        >
          {formError && (
            <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-bold text-charcoal mb-2">
              Nombre <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ingresa el nombre"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-charcoal mb-2">
              Apellido
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ingresa el apellido"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-charcoal mb-2">
              Correo electrónico <span className="text-terracotta">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@vetclinic.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-charcoal mb-2">
              {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}{' '}
              {!editingUser && <span className="text-terracotta">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required={!editingUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sage hover:text-charcoal p-1 cursor-pointer"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-sage mt-1">
              {editingUser
                ? 'Deja este campo vacío si deseas conservar la contraseña actual.'
                : 'Asigna la contraseña de acceso (se vincularán la cuenta y credenciales de login automáticamente).'}
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-charcoal mb-2">
              Rol <span className="text-terracotta">*</span>
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer shadow-2xs"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-charcoal mb-2">
              Estado en el sistema <span className="text-terracotta">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer shadow-2xs"
            >
              <option value="Activo">Activo (Habilitado)</option>
              <option value="Inactivo">Inactivo (Suspendido)</option>
            </select>
          </div>
        </form>

        {/* Footer fijo */}
        <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-border-tan/70 bg-white">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="user-drawer-form"
            disabled={isSubmitting}
            className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer active:translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Guardando...'
              : editingUser
                ? 'Guardar cambios'
                : 'Guardar usuario'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   2. DRAWER / PANEL LATERAL: NUEVO ROL
   ============================================================================ */
interface RoleDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    description: string
    baseRoleId?: string
  }) => void
  roles: RoleDefinition[]
}

function RoleDrawer({
  isOpen,
  onClose,
  onSave,
  roles,
}: RoleDrawerProps) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [baseRoleId, setBaseRoleId] = useState('veterinario')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setName('')
      setDescription('')
      setBaseRoleId(roles[0]?.id || 'veterinario')
      setFormError(null)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [isOpen, roles])

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

    if (!name.trim()) {
      setFormError('Por favor ingresa el nombre del rol.')
      return
    }

    if (!description.trim()) {
      setFormError('Por favor ingresa una breve descripción del rol.')
      return
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      baseRoleId,
    })
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-role-title"
    >
      <div
        className={`w-full sm:w-[420px] lg:w-[450px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white">
          <h2
            id="drawer-role-title"
            className="text-xl sm:text-2xl font-bold text-brand tracking-tight"
          >
            Nuevo Rol
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
            aria-label="Cerrar panel"
          >
            <span className="text-xl font-medium leading-none">✕</span>
          </button>
        </div>

        {/* Formulario con scroll independiente */}
        <form
          id="role-drawer-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5"
        >
          {formError && (
            <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-bold text-charcoal mb-2">
              Nombre del Rol <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Pasante de Veterinaria"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-charcoal mb-2">
              Descripción de Responsabilidad <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Asistencia en cirugías y fichas"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-charcoal mb-2">
              Copiar permisos base de:
            </label>
            <select
              value={baseRoleId}
              onChange={(e) => setBaseRoleId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition cursor-pointer shadow-2xs"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.description})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-sage mt-1.5">
              El nuevo rol heredará inicialmente estos permisos, que luego podrás personalizar en la matriz.
            </p>
          </div>
        </form>

        {/* Footer fijo */}
        <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-border-tan/70 bg-white">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="role-drawer-form"
            className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-terracotta hover:bg-[#b55e43] text-white transition shadow-xs cursor-pointer active:translate-y-0.5"
          >
            Crear Rol
          </button>
        </div>
      </div>
    </div>
  )
}


/* ============================================================================
   3. MATRIZ DE PERMISOS (compartida entre modos)
   ============================================================================ */
interface PermissionMatrixPanelProps {
  permissionTarget: PermissionTarget
  selectedRole: RoleDefinition
  selectedTargetUser: SystemUser | null
  activeTargetRole: RoleDefinition
  activePermissions: Record<ModuleId, ModulePermission>
  isUserTargetCustomized: boolean
  modulesInfo: ModuleInfo[]
  usersCountForRole?: number
  onTogglePermission: (
    moduleId: ModuleId,
    permissionKey: keyof ModulePermission
  ) => void
  onSavePermissions: () => void
  onResetUserPermissions: () => void
}

function PermissionMatrixPanel({
  permissionTarget,
  selectedRole,
  selectedTargetUser,
  activeTargetRole,
  activePermissions,
  isUserTargetCustomized,
  modulesInfo,
  usersCountForRole = 0,
  onTogglePermission,
  onSavePermissions,
  onResetUserPermissions,
}: PermissionMatrixPanelProps) {
  const isTargetUser = permissionTarget.type === 'user' && selectedTargetUser !== null

  return (
    <div
      key={`${permissionTarget.type}-${permissionTarget.id}`}
      className="bg-white/95 backdrop-blur-xs rounded-2xl p-3 sm:p-4 border border-border-tan shadow-[0_4px_24px_rgba(35,78,70,0.035)] flex flex-col flex-1 min-h-0 overflow-hidden"
    >
      <div className="shrink-0 pb-2 border-b border-border-tan/60 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-brand tracking-tight truncate">
              {isTargetUser
                ? `Permisos de: ${selectedTargetUser.name}`
                : `Permisos del rol: ${selectedRole.name}`}
            </h2>
            {isTargetUser && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cream text-brand border border-border-tan">
                Rol base: {selectedTargetUser.roleName}
              </span>
            )}
            {isTargetUser && isUserTargetCustomized && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-soft text-terracotta border border-terracotta/20">
                Con excepciones
              </span>
            )}
          </div>
          <p className="text-[11px] text-sage mt-0.5 line-clamp-1">
            {isTargetUser
              ? `Los cambios aquí solo afectan a ${selectedTargetUser.name}. Hereda de ${activeTargetRole.name} salvo excepciones.`
              : `Estos permisos aplican a ${usersCountForRole} usuario${usersCountForRole === 1 ? '' : 's'} con el rol "${selectedRole.name}".`}
          </p>
        </div>

        {isTargetUser && isUserTargetCustomized && (
          <button
            type="button"
            onClick={onResetUserPermissions}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border-tan bg-bone hover:bg-cream text-charcoal text-[11px] font-semibold transition cursor-pointer shrink-0 shadow-2xs"
            title="Restablecer a los permisos predeterminados del rol"
          >
            <span>Restablecer a rol base</span>
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <table className="w-full table-fixed text-left border-collapse">
          <thead>
            <tr className="bg-bone text-[11px] font-bold text-charcoal/80 border border-border-tan/60">
              <th className="py-1.5 px-2 w-[34%]">Módulo</th>
              <th className="py-1.5 px-1 text-center w-[16.5%]">Ver</th>
              <th className="py-1.5 px-1 text-center w-[16.5%]">Crear</th>
              <th className="py-1.5 px-1 text-center w-[16.5%]">Editar</th>
              <th className="py-1.5 px-1 text-center w-[16.5%]">Eliminar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-tan/35 text-[11px]">
            {modulesInfo.map((mod) => {
              const perms: ModulePermission = activePermissions[mod.id] || {
                view: false,
                create: false,
                edit: false,
                delete: false,
              }

              return (
                <tr key={mod.id} className="hover:bg-bone/40 transition-colors">
                  <td className="py-1.5 px-2 font-semibold text-charcoal truncate">
                    {mod.label}
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    <input
                      type="checkbox"
                      checked={perms.view}
                      onChange={() => onTogglePermission(mod.id, 'view')}
                      className="w-4 h-4 rounded border border-brand/40 text-brand accent-brand cursor-pointer"
                      aria-label={`Permiso Ver para ${mod.label}`}
                    />
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    {mod.supportsCreate !== false ? (
                      <input
                        type="checkbox"
                        checked={perms.create}
                        onChange={() => onTogglePermission(mod.id, 'create')}
                        className="w-4 h-4 rounded border border-brand/40 text-brand accent-brand cursor-pointer"
                        aria-label={`Permiso Crear para ${mod.label}`}
                      />
                    ) : (
                      <span className="text-sage/40 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    {mod.supportsEdit !== false ? (
                      <input
                        type="checkbox"
                        checked={perms.edit}
                        onChange={() => onTogglePermission(mod.id, 'edit')}
                        className="w-4 h-4 rounded border border-brand/40 text-brand accent-brand cursor-pointer"
                        aria-label={`Permiso Editar para ${mod.label}`}
                      />
                    ) : (
                      <span className="text-sage/40 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    {mod.supportsDelete !== false ? (
                      <input
                        type="checkbox"
                        checked={perms.delete}
                        onChange={() => onTogglePermission(mod.id, 'delete')}
                        className="w-4 h-4 rounded border border-brand/40 text-brand accent-brand cursor-pointer"
                        aria-label={`Permiso Eliminar para ${mod.label}`}
                      />
                    ) : (
                      <span className="text-sage/40 text-[10px]">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="shrink-0 pt-2 mt-2 border-t border-border-tan/60 flex items-center justify-between gap-3">
        <span className="text-[11px] text-sage truncate">
          {isTargetUser
            ? `Excepciones para ${selectedTargetUser.name}`
            : `Permisos por defecto del rol ${selectedRole.name}`}
        </span>
        <button
          type="button"
          onClick={onSavePermissions}
          className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition shadow-xs cursor-pointer active:translate-y-0.5 shrink-0"
        >
          {isTargetUser ? 'Guardar excepciones' : 'Guardar permisos del rol'}
        </button>
      </div>
    </div>
  )
}

/* ============================================================================
   4. MODO POR USUARIO: lista + ficha + permisos
   ============================================================================ */
interface ByUserModeViewProps {
  users: SystemUser[]
  roles: RoleDefinition[]
  filters: UserFilters
  selectedUserId: string | null
  permissionTarget: PermissionTarget
  selectedTargetUser: SystemUser | null
  activeTargetRole: RoleDefinition
  activePermissions: Record<ModuleId, ModulePermission>
  isUserTargetCustomized: boolean
  modulesInfo: ModuleInfo[]
  onFilterChange: (filters: UserFilters) => void
  onSelectUser: (userId: string) => void
  onOpenEditModal: (user: SystemUser) => void
  onToggleStatus: (userId: string) => void
  onDeleteUser: (userId: string) => void
  onTogglePermission: (
    moduleId: ModuleId,
    permissionKey: keyof ModulePermission
  ) => void
  onSavePermissions: () => void
  onResetUserPermissions: () => void
  showPermissionMatrix?: boolean
}

function ByUserModeView({
  users,
  roles,
  filters,
  selectedUserId,
  permissionTarget,
  selectedTargetUser,
  activeTargetRole,
  activePermissions,
  isUserTargetCustomized,
  modulesInfo,
  onFilterChange,
  onSelectUser,
  onOpenEditModal,
  onToggleStatus,
  onDeleteUser,
  onTogglePermission,
  onSavePermissions,
  onResetUserPermissions,
  showPermissionMatrix = true,
}: ByUserModeViewProps) {
  const [showMobileDetail, setShowMobileDetail] = useState(false)

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId)
    setShowMobileDetail(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full min-h-0 overflow-hidden">
      <div
        className={`lg:col-span-4 h-full min-h-0 min-w-0 flex flex-col animate-pop-in stagger-1 ${
          showMobileDetail ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-3 border border-border-tan shadow-[0_4px_20px_rgba(35,78,70,0.03)] flex flex-col flex-1 min-h-0 overflow-hidden">
          <span className="text-[10px] font-bold text-sage uppercase tracking-wider block px-1 shrink-0">
            Cuentas ({users.length})
          </span>

          <div className="relative shrink-0 mt-2">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sage w-3.5 h-3.5 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Buscar usuario..."
              className="w-full pl-8 pr-2.5 py-2 rounded-lg border border-border-tan bg-bone/50 text-xs text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 shrink-0 mt-2">
            <select
              value={filters.roleFilter}
              onChange={(e) => onFilterChange({ ...filters, roleFilter: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border-tan bg-white text-xs text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer shadow-2xs"
            >
              <option value="all">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            <select
              value={filters.statusFilter}
              onChange={(e) => onFilterChange({ ...filters, statusFilter: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border-tan bg-white text-xs text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer shadow-2xs"
            >
              <option value="all">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div className="space-y-1 flex-1 min-h-0 overflow-hidden mt-2">
            {users.length === 0 ? (
              <p className="text-xs text-sage text-center py-6">No se encontraron usuarios</p>
            ) : (
              users.map((user) => {
                const isSelected = selectedUserId === user.id
                const customized = hasCustomPermissions(user)

                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className={`group relative rounded-lg py-1.5 px-2 cursor-pointer transition-all duration-150 flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-cream border border-brand/50 shadow-2xs'
                        : 'bg-bone/60 hover:bg-bone border border-border-tan/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isSelected
                            ? 'bg-brand text-white'
                            : 'bg-mint-soft text-brand border border-brand/15'
                        }`}
                      >
                        {getUserInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h4
                            className={`text-xs font-bold truncate leading-tight ${
                              isSelected ? 'text-brand' : 'text-charcoal'
                            }`}
                          >
                            {user.name}
                          </h4>
                          {customized && (
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta shrink-0"
                              title="Tiene excepciones de permisos"
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-sage truncate block leading-tight">
                          {user.roleName}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
                        user.status === 'Activo'
                          ? 'bg-mint-soft text-brand'
                          : 'bg-bone text-sage'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          <p className="text-[10px] text-sage font-medium px-1 pt-1.5 border-t border-border-tan/40 shrink-0">
            Mostrando {users.length} usuario{users.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div
        className={`lg:col-span-8 h-full min-h-0 min-w-0 flex flex-col gap-2 overflow-hidden animate-pop-in stagger-2 ${
          showMobileDetail ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {selectedTargetUser ? (
          <>
            <button
              type="button"
              onClick={() => setShowMobileDetail(false)}
              className="lg:hidden text-xs font-bold text-brand hover:underline cursor-pointer shrink-0"
            >
              Volver a la lista
            </button>

            <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-3 border border-border-tan shadow-[0_4px_20px_rgba(35,78,70,0.03)] shrink-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-mint-soft text-brand border border-brand/15 flex items-center justify-center text-xs font-bold shrink-0">
                    {getUserInitials(selectedTargetUser.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-charcoal truncate">
                      {selectedTargetUser.name}
                    </h3>
                    <p className="text-[11px] text-sage truncate">{selectedTargetUser.email}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-cream text-brand border border-border-tan">
                        {selectedTargetUser.roleName}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                          selectedTargetUser.status === 'Activo'
                            ? 'bg-mint-soft text-brand border border-brand/10'
                            : 'bg-bone text-sage border border-border-tan'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedTargetUser.status === 'Activo' ? 'bg-brand' : 'bg-sage'
                          }`}
                        />
                        {selectedTargetUser.status}
                      </span>
                      <span className="text-[9px] text-sage truncate">
                        Registro: {selectedTargetUser.registrationDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenEditModal(selectedTargetUser)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-tan bg-bone hover:bg-cream text-charcoal text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                  >
                    <EditIcon className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(selectedTargetUser.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-tan bg-bone hover:bg-cream text-charcoal text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                  >
                    <span>{selectedTargetUser.status === 'Activo' ? 'Desactivar' : 'Activar'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteUser(selectedTargetUser.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-terracotta/20 bg-terracotta-soft text-terracotta text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                  >
                    <TrashIcon className="w-3 h-3" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {showPermissionMatrix ? (
            <PermissionMatrixPanel
              permissionTarget={permissionTarget}
              selectedRole={activeTargetRole}
              selectedTargetUser={selectedTargetUser}
              activeTargetRole={activeTargetRole}
              activePermissions={activePermissions}
              isUserTargetCustomized={isUserTargetCustomized}
              modulesInfo={modulesInfo}
              onTogglePermission={onTogglePermission}
              onSavePermissions={onSavePermissions}
              onResetUserPermissions={onResetUserPermissions}
            />
            ) : (
              <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-4 border border-border-tan text-sm text-sage">
                Como administrador de clínica puedes crear y gestionar cuentas, pero no puedes
                cambiar permisos ni bloquear vistas. Eso solo lo hace el SuperAdmin.
              </div>
            )}
            </div>
          </>
        ) : (
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-8 border border-border-tan text-center text-sage text-sm">
            Selecciona un usuario de la lista para ver su ficha y permisos.
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================================
   5. MODO POR ROL: plantillas + matriz
   ============================================================================ */
interface ByRoleModeViewProps {
  roles: RoleDefinition[]
  users: SystemUser[]
  permissionTarget: PermissionTarget
  selectedRole: RoleDefinition
  activePermissions: Record<ModuleId, ModulePermission>
  modulesInfo: ModuleInfo[]
  onSelectRole: (roleId: string) => void
  onTogglePermission: (
    moduleId: ModuleId,
    permissionKey: keyof ModulePermission
  ) => void
  onSavePermissions: () => void
}

function ByRoleModeView({
  roles,
  users,
  permissionTarget,
  selectedRole,
  activePermissions,
  modulesInfo,
  onSelectRole,
  onTogglePermission,
  onSavePermissions,
}: ByRoleModeViewProps) {
  const usersCountForRole = users.filter((u) => u.roleId === selectedRole.id).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full min-h-0 overflow-hidden">
      <div className="lg:col-span-4 h-full min-h-0 min-w-0 flex flex-col animate-pop-in stagger-1">
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-3 border border-border-tan shadow-[0_4px_20px_rgba(35,78,70,0.03)] flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between px-1 shrink-0">
            <span className="text-[10px] font-bold text-sage uppercase tracking-wider block">
              Plantillas de rol ({roles.length})
            </span>
          </div>

          <div className="space-y-1 flex-1 min-h-0 overflow-hidden mt-2">
            {roles.map((role) => {
              const isSelected =
                permissionTarget.type === 'role' && permissionTarget.id === role.id
              const roleUsersCount = users.filter((u) => u.roleId === role.id).length

              return (
                <div
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  className={`group relative rounded-lg py-1.5 px-2.5 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-cream border border-brand/50 shadow-2xs'
                      : 'bg-bone/70 hover:bg-bone border border-border-tan/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-xs font-bold truncate leading-tight ${
                          isSelected ? 'text-brand' : 'text-charcoal'
                        }`}
                      >
                        {role.name}
                      </h3>
                      <p className="text-[11px] text-sage mt-0.5 truncate leading-none">
                        {role.description}
                      </p>
                      <p className="text-[10px] text-sage/80 mt-1">
                        {roleUsersCount} usuario{roleUsersCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-brand shrink-0" title="Rol seleccionado">
                        <EditIcon className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 h-full min-h-0 min-w-0 flex flex-col overflow-hidden animate-pop-in stagger-2">
        <PermissionMatrixPanel
          permissionTarget={permissionTarget}
          selectedRole={selectedRole}
          selectedTargetUser={null}
          activeTargetRole={selectedRole}
          activePermissions={activePermissions}
          isUserTargetCustomized={false}
          modulesInfo={modulesInfo}
          usersCountForRole={usersCountForRole}
          onTogglePermission={onTogglePermission}
          onSavePermissions={onSavePermissions}
          onResetUserPermissions={() => undefined}
        />
      </div>
    </div>
  )
}


export interface UserSuperAdminProps {
  onNavigate?: (routeId: string) => void
  activeRoute?: string
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onCloseSidebar?: () => void
  userName?: string
  userRole?: string
  onLogout?: () => void
  canViewModule?: (moduleId: ModuleId) => boolean
  // Solo SuperAdmin de plataforma puede editar matriz / excepciones de vistas
  canManagePermissions?: boolean
  notifications?: NotificacionSuperAdmin[]
  isLoadingNotifications?: boolean
  notificationsError?: string | null
  onMarkNotificationRead?: (id: string) => void
  onMarkAllNotificationsRead?: () => void
  onReloadNotifications?: () => void
}

/* ============================================================================
   5. COMPONENTE PRINCIPAL: USER ADMIN
   ============================================================================ */
export function UserSuperAdmin({
  onNavigate,
  activeRoute = 'usuarios',
  isSidebarOpen: externalIsSidebarOpen,
  onToggleSidebar: externalOnToggleSidebar,
  onCloseSidebar: externalOnCloseSidebar,
  userName = 'SuperAdmin Veterinario',
  userRole = 'SuperAdministrador',
  onLogout,
  canViewModule: shellCanViewModule,
  canManagePermissions = true,
  notifications,
  isLoadingNotifications,
  notificationsError,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onReloadNotifications,
}: UserSuperAdminProps) {
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false)

  const {
    users,
    roles,
    permissionTarget,
    selectRoleTarget,
    selectUserTarget,
    selectedRole,
    selectedTargetUser,
    activeTargetRole,
    activePermissions,
    isUserTargetCustomized,
    resetUserPermissions,
    activeTab,
    setAccessMode,
    filters,
    setFilters,
    filteredUsers,
    modulesInfo,
    activeNotification,
    showToast,
    canView,
    togglePermission,
    saveRolePermissions,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    createRole,
    isUserModalOpen,
    editingUser,
    openCreateUserModal,
    openEditUserModal,
    closeUserModal,
    isRoleModalOpen,
    openCreateRoleModal,
    closeRoleModal,
  } = useUserSuperAdmin()

  const isSidebarOpen =
    externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen
  const toggleSidebar =
    externalOnToggleSidebar || (() => setInternalIsSidebarOpen((prev) => !prev))
  const closeSidebar =
    externalOnCloseSidebar || (() => setInternalIsSidebarOpen(false))

  const handleSidebarNavigate = (routeId: string) => {
    if (onNavigate) {
      onNavigate(routeId)
    } else {
      showToast(`Navegando a: ${routeId}`)
    }
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-bone relative text-slate">
      {/* 1. Header Fijo */}
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        userName={userName}
        userRole={userRole}
        notifications={notifications}
        isLoadingNotifications={isLoadingNotifications}
        notificationsError={notificationsError}
        onMarkNotificationRead={onMarkNotificationRead}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        onReloadNotifications={onReloadNotifications}
        onProfileClick={() => showToast('Abriendo panel de perfil de superadministrador')}
      />


      {/* 2. Cuerpo Principal con Sidebar y Área de Trabajo */}
      <div className="flex-1 flex overflow-hidden relative">
        <SuperAdminSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleSidebarNavigate}
          canViewModule={shellCanViewModule || canView}
          onLogout={onLogout}
        />


        <main
          key={activeRoute}
          className="flex-1 min-h-0 overflow-hidden relative p-3 sm:p-4 lg:p-5 flex flex-col gap-3 animate-view-popup"
        >
          <DashboardBackgroundDecoration />

          {activeNotification && (
            <div
              className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-brand text-white text-xs sm:text-sm font-semibold shadow-lg border border-white/20 flex items-center gap-2 pointer-events-none"
              role="alert"
            >
              <span>{activeNotification}</span>
            </div>
          )}

          {/* Barra de modo: control de acceso */}
          <div className="relative z-10 border-b border-border-tan/70 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3 shrink-0 animate-pop-in stagger-1">
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-brand tracking-tight">
                {canManagePermissions ? 'Control de acceso' : 'Usuarios'}
              </h1>
              <p className="text-[11px] sm:text-xs text-sage">
                {canManagePermissions
                  ? activeTab === 'usuarios'
                    ? 'Gestiona cuentas y excepciones individuales.'
                    : 'Define permisos por defecto para cada rol.'
                  : 'Crea y gestiona cuentas. Los permisos solo los cambia el SuperAdmin.'}
              </p>
              {canManagePermissions && (
              <div className="flex items-center gap-6 sm:gap-8 pt-1">
                <button
                  type="button"
                  onClick={() => setAccessMode('usuarios')}
                  className={`relative font-bold text-[0.95rem] py-2 px-1 pb-3 transition-colors cursor-pointer ${
                    activeTab === 'usuarios'
                      ? 'text-brand after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-brand after:rounded-full'
                      : 'text-text-muted hover:text-brand'
                  }`}
                >
                  Por usuario
                </button>

                <button
                  type="button"
                  onClick={() => setAccessMode('roles')}
                  className={`relative font-bold text-[0.95rem] py-2 px-1 pb-3 transition-colors cursor-pointer ${
                    activeTab === 'roles'
                      ? 'text-brand after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-brand after:rounded-full'
                      : 'text-text-muted hover:text-brand'
                  }`}
                >
                  Por rol
                </button>
              </div>
              )}
            </div>

            {(canManagePermissions ? activeTab === 'usuarios' : true) ? (
              <button
                type="button"
                onClick={openCreateUserModal}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer shrink-0 active:translate-y-0.5 self-start sm:self-auto"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Nuevo usuario</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreateRoleModal}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-terracotta hover:bg-[#b55e43] text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer shrink-0 active:translate-y-0.5 self-start sm:self-auto"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Nuevo rol</span>
              </button>
            )}
          </div>

          {/* Contenido según modo activo */}
          <div key={activeTab} className="relative z-10 flex-1 min-h-0 overflow-hidden flex flex-col">
            {!canManagePermissions || activeTab === 'usuarios' ? (
              <ByUserModeView
                users={filteredUsers}
                roles={roles}
                filters={filters}
                selectedUserId={
                  permissionTarget.type === 'user' ? permissionTarget.id : null
                }
                permissionTarget={permissionTarget}
                selectedTargetUser={selectedTargetUser}
                activeTargetRole={activeTargetRole}
                activePermissions={activePermissions}
                isUserTargetCustomized={isUserTargetCustomized}
                modulesInfo={modulesInfo}
                onFilterChange={setFilters}
                onSelectUser={selectUserTarget}
                onOpenEditModal={openEditUserModal}
                onToggleStatus={toggleUserStatus}
                onDeleteUser={deleteUser}
                onTogglePermission={togglePermission}
                onSavePermissions={saveRolePermissions}
                onResetUserPermissions={resetUserPermissions}
                showPermissionMatrix={canManagePermissions}
              />
            ) : (
              <ByRoleModeView
                roles={roles}
                users={users}
                permissionTarget={permissionTarget}
                selectedRole={selectedRole}
                activePermissions={activePermissions}
                modulesInfo={modulesInfo}
                onSelectRole={selectRoleTarget}
                onTogglePermission={togglePermission}
                onSavePermissions={saveRolePermissions}
              />
            )}
          </div>
        </main>
      </div>


      {/* Slide-over Drawer para Crear / Editar Usuario */}
      <UserDrawer
        isOpen={isUserModalOpen}
        onClose={closeUserModal}
        onSave={async (data) => {
          if (editingUser) {
            return updateUser(editingUser.id, data)
          }
          return createUser(data)
        }}
        onSuccess={({ email, mode }) => {
          if (mode === 'create') {
            showToast(`Usuario con ${email} fue creado exitosamente`)
            return
          }
          showToast(`Usuario con ${email} fue actualizado exitosamente`)
        }}
        editingUser={editingUser}
        roles={roles}
      />

      {/* Slide-over Drawer para Crear Nuevo Rol */}
      <RoleDrawer
        isOpen={isRoleModalOpen}
        onClose={closeRoleModal}
        onSave={createRole}
        roles={roles}
      />
    </div>
  )
}
