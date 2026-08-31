import { useState, useEffect, type FormEvent } from 'react'
import {
  AdminHeader,
  AdminSidebar,
  DashboardBackgroundDecoration,
} from '../../components'
import { useUserAdmin } from '../../hooks'
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
} from '../../types'

import {
  SearchIcon,
  PlusIcon,
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
} from '@/global/components'

interface UserAdminProps {
  onNavigate?: (routeId: string) => void
  activeRoute?: string
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onCloseSidebar?: () => void
  userName?: string
  userRole?: string
  onLogout?: () => void
}


/* ============================================================================
   1. DRAWER / PANEL LATERAL: NUEVO / EDITAR USUARIO
   ============================================================================ */
interface UserDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: UserFormData) => void
  editingUser: SystemUser | null
  roles: RoleDefinition[]
}

function UserDrawer({
  isOpen,
  onClose,
  onSave,
  editingUser,
  roles,
}: UserDrawerProps) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [roleId, setRoleId] = useState('admin')
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
        setRoleId(editingUser.roleId || roles[0]?.id || 'admin')
        setStatus(editingUser.status || 'Activo')
      } else {
        setFirstName('')
        setLastName('')
        setEmail('')
        setPassword('')
        setRoleId('admin')
        setStatus('Activo')
      }
      setShowPassword(false)
      setFormError(null)
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

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password.trim() || undefined,
      roleId,
      status,
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
      aria-labelledby="drawer-user-title"
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
                : 'Asigna la clave inicial para el acceso de este usuario.'}
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
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="user-drawer-form"
            className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer active:translate-y-0.5"
          >
            {editingUser ? 'Guardar cambios' : 'Guardar usuario'}
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
   3. PESTAÑA: USUARIOS (TABLA Y FILTROS)
   ============================================================================ */
interface UsersTabProps {
  users: SystemUser[]
  roles: RoleDefinition[]
  filters: UserFilters
  onFilterChange: (filters: UserFilters) => void
  onOpenCreateModal: () => void
  onOpenEditModal: (user: SystemUser) => void
  onDeleteUser: (userId: string) => void
  onToggleStatus: (userId: string) => void
}

function UsersTab({
  users,
  roles,
  filters,
  onFilterChange,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteUser,
  onToggleStatus,
}: UsersTabProps) {
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null)

  const toggleMenu = (userId: string) => {
    setActiveMenuUserId((current) => (current === userId ? null : userId))
  }

  const closeMenu = () => {
    setActiveMenuUserId(null)
  }

  return (
    <div className="space-y-4 sm:space-y-5" onClick={closeMenu}>
      {/* Barra de Filtros y Acciones */}
      <div
        className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 animate-pop-in stagger-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1 max-w-3xl">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                onFilterChange({ ...filters, searchQuery: e.target.value })
              }
              placeholder="Buscar usuario..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage hover:text-charcoal cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro por Rol */}
          <div className="w-full sm:w-auto min-w-[150px]">
            <select
              value={filters.roleFilter}
              onChange={(e) =>
                onFilterChange({ ...filters, roleFilter: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer shadow-2xs"
            >
              <option value="all">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="w-full sm:w-auto min-w-[150px]">
            <select
              value={filters.statusFilter}
              onChange={(e) =>
                onFilterChange({ ...filters, statusFilter: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer shadow-2xs"
            >
              <option value="all">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Botón + Nuevo usuario */}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer shrink-0 active:translate-y-0.5"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Nuevo usuario</span>
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-4 sm:p-5 lg:p-6 border border-border-tan shadow-[0_4px_24px_rgba(35,78,70,0.035)] relative overflow-hidden animate-pop-in stagger-2 flex flex-col justify-between min-h-[440px] lg:min-h-[490px]">
        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-bone rounded-xl text-[11px] sm:text-xs font-bold text-charcoal/75 border border-border-tan/50">
                <th className="py-3 px-3.5 sm:px-4 first:rounded-l-xl">Nombre</th>
                <th className="py-3 px-3.5 sm:px-4">Correo</th>
                <th className="py-3 px-3.5 sm:px-4">Rol</th>
                <th className="py-3 px-3.5 sm:px-4">Estado</th>
                <th className="py-3 px-3.5 sm:px-4">Fecha de registro</th>
                <th className="py-3 px-3.5 sm:px-4 last:rounded-r-xl text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-tan/35 text-xs sm:text-sm">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sage">
                    No se encontraron usuarios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-bone/60 transition-colors"
                  >
                    <td className="py-3 sm:py-3.5 px-3.5 sm:px-4 font-bold text-charcoal whitespace-nowrap group-hover:text-brand transition-colors">
                      {user.name}
                    </td>
                    <td className="py-3 sm:py-3.5 px-3.5 sm:px-4 text-charcoal/80 font-medium">
                      {user.email}
                    </td>
                    <td className="py-3 sm:py-3.5 px-3.5 sm:px-4 text-charcoal/90 font-medium whitespace-nowrap">
                      {user.roleName}
                    </td>
                    <td className="py-3 sm:py-3.5 px-3.5 sm:px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                          user.status === 'Activo'
                            ? 'bg-mint-soft text-brand border border-brand/10'
                            : 'bg-bone text-sage border border-border-tan'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Activo' ? 'bg-[#234E46]' : 'bg-[#9AA8A2]'
                          }`}
                        />
                        <span>{user.status}</span>
                      </span>
                    </td>
                    <td className="py-3 sm:py-3.5 px-3.5 sm:px-4 text-charcoal/70 whitespace-nowrap">
                      {user.registrationDate}
                    </td>
                    <td
                      className="py-3 sm:py-3.5 px-3.5 sm:px-4 text-center relative whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => toggleMenu(user.id)}
                        className="p-1.5 text-sage hover:text-charcoal hover:bg-border-tan/40 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Acciones para ${user.name}`}
                      >
                        <MoreVerticalIcon className="w-4 h-4" />
                      </button>

                      {activeMenuUserId === user.id && (
                        <div className="absolute right-4 top-10 z-30 w-44 bg-white rounded-2xl shadow-lg border border-border-tan p-1.5 text-left text-xs modal-content-animate">
                          <button
                            type="button"
                            onClick={() => {
                              closeMenu()
                              onOpenEditModal(user)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-bone hover:text-brand font-semibold transition cursor-pointer"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              closeMenu()
                              onToggleStatus(user.id)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-bone font-semibold transition cursor-pointer"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                user.status === 'Activo' ? 'bg-sage' : 'bg-brand'
                              }`}
                            />
                            <span>
                              {user.status === 'Activo'
                                ? 'Desactivar'
                                : 'Activar'}
                            </span>
                          </button>

                          <div className="my-1 border-t border-border-tan/50" />

                          <button
                            type="button"
                            onClick={() => {
                              closeMenu()
                              onDeleteUser(user.id)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-terracotta hover:bg-terracotta-soft font-semibold transition cursor-pointer"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de Paginación / Footer */}
        <div className="pt-4 mt-auto border-t border-border-tan/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sage">
          <p className="font-medium">
            Mostrando <span className="font-bold text-charcoal">{users.length}</span> de <span className="font-bold text-charcoal">{users.length}</span> usuarios
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="px-3 py-1.5 rounded-lg border border-border-tan text-sage/60 font-semibold bg-bone/40 cursor-not-allowed text-xs"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-brand text-white font-bold text-xs shadow-2xs">
              1
            </span>
            <button
              type="button"
              disabled
              className="px-3 py-1.5 rounded-lg border border-border-tan text-sage/60 font-semibold bg-bone/40 cursor-not-allowed text-xs"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


/* ============================================================================
   4. PESTAÑA: ROLES, USUARIOS Y MATRIZ DE PERMISOS
   ============================================================================ */
interface RolesPermissionsTabProps {
  roles: RoleDefinition[]
  users: SystemUser[]
  permissionTarget: PermissionTarget
  onSelectRole: (roleId: string) => void
  onSelectUser: (userId: string) => void
  selectedRole: RoleDefinition
  selectedTargetUser: SystemUser | null
  activeTargetRole: RoleDefinition
  activePermissions: Record<ModuleId, ModulePermission>
  isUserTargetCustomized: boolean
  onResetUserPermissions: () => void
  modulesInfo: ModuleInfo[]
  onTogglePermission: (
    moduleId: ModuleId,
    permissionKey: keyof ModulePermission
  ) => void
  onSavePermissions: () => void
  onOpenCreateRoleDrawer: () => void
}

function RolesPermissionsTab({
  roles,
  users,
  permissionTarget,
  onSelectRole,
  onSelectUser,
  selectedRole,
  selectedTargetUser,
  activeTargetRole,
  activePermissions,
  isUserTargetCustomized,
  onResetUserPermissions,
  modulesInfo,
  onTogglePermission,
  onSavePermissions,
  onOpenCreateRoleDrawer,
}: RolesPermissionsTabProps) {
  const [userSearch, setUserSearch] = useState('')

  const filteredTargetUsers = users.filter((u) => {
    if (!userSearch.trim()) return true
    const q = userSearch.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.roleName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const isTargetUser = permissionTarget.type === 'user' && selectedTargetUser !== null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
      {/* =========================================================================
          COLUMNA IZQUIERDA: Roles Definidos + Lista de Usuarios
          ========================================================================= */}
      <div className="lg:col-span-4 xl:col-span-3.5 space-y-3 animate-pop-in stagger-1">
        {/* Botón "+ Nuevo rol" */}
        <button
          type="button"
          onClick={onOpenCreateRoleDrawer}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-terracotta hover:bg-[#b55e43] text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:translate-y-0.5"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Nuevo rol</span>
        </button>

        {/* Bloque 1: Roles Definidos */}
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-3 border border-border-tan space-y-2 shadow-[0_4px_20px_rgba(35,78,70,0.03)]">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-sage uppercase tracking-wider block">
              Roles Definidos ({roles.length})
            </span>
            <span className="text-[9px] font-semibold text-sage/70">Por Rol</span>
          </div>

          <div className="space-y-1.5">
            {roles.map((role) => {
              const isSelected =
                permissionTarget.type === 'role' && permissionTarget.id === role.id

              return (
                <div
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  className={`
                    group relative rounded-xl py-2 px-3 cursor-pointer transition-all duration-150
                    ${
                      isSelected
                        ? 'bg-cream border border-brand/50 shadow-2xs'
                        : 'bg-bone/70 hover:bg-bone border border-border-tan/60'
                    }
                  `}
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

        {/* Bloque 2: Asignar Permisos por Usuario Individual */}
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-3 border border-border-tan space-y-2 shadow-[0_4px_20px_rgba(35,78,70,0.03)]">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-sage uppercase tracking-wider block">
              Usuarios Individuales ({users.length})
            </span>
            <span className="text-[9px] font-semibold text-sage/70">Personalizar</span>
          </div>

          {/* Buscador de usuario */}
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sage w-3 h-3 pointer-events-none" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full pl-7 pr-2.5 py-1.5 rounded-lg border border-border-tan bg-bone/50 text-[11px] text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
            />
            {userSearch && (
              <button
                type="button"
                onClick={() => setUserSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-sage hover:text-charcoal cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Lista de Usuarios */}
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
            {filteredTargetUsers.length === 0 ? (
              <p className="text-[11px] text-sage text-center py-3">No se encontraron usuarios</p>
            ) : (
              filteredTargetUsers.map((u) => {
                const isSelected =
                  permissionTarget.type === 'user' && permissionTarget.id === u.id
                const hasCustom = !!u.customPermissions && Object.keys(u.customPermissions).length > 0

                return (
                  <div
                    key={u.id}
                    onClick={() => onSelectUser(u.id)}
                    className={`
                      group relative rounded-xl py-1.5 px-2.5 cursor-pointer transition-all duration-150 flex items-center justify-between gap-2
                      ${
                        isSelected
                          ? 'bg-cream border border-brand/50 shadow-2xs'
                          : 'bg-bone/60 hover:bg-bone border border-border-tan/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Avatar / Iniciales */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isSelected
                            ? 'bg-brand text-white'
                            : 'bg-mint-soft text-brand border border-brand/15'
                        }`}
                      >
                        {u.name
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h4
                            className={`text-xs font-bold truncate leading-tight ${
                              isSelected ? 'text-brand' : 'text-charcoal'
                            }`}
                          >
                            {u.name}
                          </h4>
                          {hasCustom && (
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta shrink-0"
                              title="Permisos personalizados asignados"
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-sage truncate block leading-tight">
                          {u.roleName}
                        </span>
                      </div>
                    </div>

                    {hasCustom && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-terracotta-soft text-terracotta shrink-0">
                        Personalizado
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>


      {/* =========================================================================
          COLUMNA DERECHA: Matriz de Permisos (Dinámica para Rol o Usuario)
          ========================================================================= */}
      <div
        key={`${permissionTarget.type}-${permissionTarget.id}`}
        className="lg:col-span-8 xl:col-span-8.5 bg-white/95 backdrop-blur-xs rounded-3xl p-5 sm:p-6 lg:p-7 border border-border-tan shadow-[0_4px_24px_rgba(35,78,70,0.035)] flex flex-col justify-between min-h-[520px] animate-pop-in stagger-2"
      >
        <div>
          {/* Header de la Matriz */}
          <div className="pb-4 border-b border-border-tan/60 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-brand tracking-tight">
                  {isTargetUser
                    ? `Permisos de Usuario: ${selectedTargetUser.name}`
                    : `Permisos: ${selectedRole.name}`}
                </h2>
                {isTargetUser && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cream text-brand border border-border-tan">
                    Rol: {selectedTargetUser.roleName}
                  </span>
                )}
                {isTargetUser && isUserTargetCustomized && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-soft text-terracotta border border-terracotta/20">
                    Personalizado
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-sage mt-1">
                {isTargetUser
                  ? `Configurando permisos específicos para ${selectedTargetUser.name}. Sobrescriben los permisos predeterminados de ${activeTargetRole.name}.`
                  : `Configura el acceso a los módulos del sistema para todos los usuarios con el rol "${selectedRole.name}".`}
              </p>
            </div>

            {/* Botón para restablecer permisos en caso de usuario con overrides */}
            {isTargetUser && isUserTargetCustomized && (
              <button
                type="button"
                onClick={onResetUserPermissions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-tan bg-bone hover:bg-cream text-charcoal text-xs font-semibold transition cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
                title="Restablecer a los permisos predeterminados del rol"
              >
                <span>↺ Restablecer a rol base</span>
              </button>
            )}
          </div>

          {/* Tabla Matriz de Permisos */}
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-bone rounded-xl text-xs font-bold text-charcoal/80 border border-border-tan/60">
                  <th className="py-3 px-4 first:rounded-l-xl w-2/5">Módulo</th>
                  <th className="py-3 px-3 text-center">Ver</th>
                  <th className="py-3 px-3 text-center">Crear</th>
                  <th className="py-3 px-3 text-center">Editar</th>
                  <th className="py-3 px-3 last:rounded-r-xl text-center">Eliminar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-tan/35 text-xs sm:text-sm">
                {modulesInfo.map((mod) => {
                  const perms: ModulePermission = activePermissions[mod.id] || {
                    view: false,
                    create: false,
                    edit: false,
                    delete: false,
                  }

                  return (
                    <tr
                      key={mod.id}
                      className="hover:bg-bone/40 transition-colors group"
                    >
                      <td className="py-3 px-4 font-bold text-charcoal group-hover:text-brand transition-colors">
                        {mod.label}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perms.view}
                          onChange={() => onTogglePermission(mod.id, 'view')}
                          className="w-[1.15rem] h-[1.15rem] rounded-[0.35rem] border border-brand/40 text-brand accent-brand cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Permiso Ver para ${mod.label}`}
                        />
                      </td>

                      <td className="py-3 px-3 text-center">
                        {mod.supportsCreate !== false ? (
                          <input
                            type="checkbox"
                            checked={perms.create}
                            onChange={() => onTogglePermission(mod.id, 'create')}
                            className="w-[1.15rem] h-[1.15rem] rounded-[0.35rem] border border-brand/40 text-brand accent-brand cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={`Permiso Crear para ${mod.label}`}
                          />
                        ) : (
                          <span className="text-sage/40 text-xs font-medium">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {mod.supportsEdit !== false ? (
                          <input
                            type="checkbox"
                            checked={perms.edit}
                            onChange={() => onTogglePermission(mod.id, 'edit')}
                            className="w-[1.15rem] h-[1.15rem] rounded-[0.35rem] border border-brand/40 text-brand accent-brand cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={`Permiso Editar para ${mod.label}`}
                          />
                        ) : (
                          <span className="text-sage/40 text-xs font-medium">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {mod.supportsDelete !== false ? (
                          <input
                            type="checkbox"
                            checked={perms.delete}
                            onChange={() => onTogglePermission(mod.id, 'delete')}
                            className="w-[1.15rem] h-[1.15rem] rounded-[0.35rem] border border-brand/40 text-brand accent-brand cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={`Permiso Eliminar para ${mod.label}`}
                          />
                        ) : (
                          <span className="text-sage/40 text-xs font-medium">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer con Botón Guardar cambios */}
        <div className="pt-6 mt-6 border-t border-border-tan/60 flex items-center justify-between gap-4">
          <span className="text-xs text-sage">
            {isTargetUser
              ? `Asignando permisos específicos para ${selectedTargetUser.name}`
              : `Modificando permisos globales para el rol ${selectedRole.name}`}
          </span>
          <button
            type="button"
            onClick={onSavePermissions}
            className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer active:translate-y-0.5"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}


interface UserAdminProps {
  onNavigate?: (routeId: string) => void
  activeRoute?: string
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onCloseSidebar?: () => void
}

/* ============================================================================
   5. COMPONENTE PRINCIPAL: USER ADMIN
   ============================================================================ */
export function UserAdmin({
  onNavigate,
  activeRoute = 'usuarios',
  isSidebarOpen: externalIsSidebarOpen,
  onToggleSidebar: externalOnToggleSidebar,
  onCloseSidebar: externalOnCloseSidebar,
  userName = 'Admin Veterinario',
  userRole = 'Administrador',
  onLogout,
}: UserAdminProps) {
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

    setActiveTab,
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
  } = useUserAdmin()

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
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        userName={userName}
        userRole={userRole}
        onNotificationClick={() => showToast('Tienes 3 notificaciones del sistema')}
        onProfileClick={() => showToast('Abriendo panel de perfil de administrador')}
      />


      {/* 2. Cuerpo Principal con Sidebar y Área de Trabajo */}
      <div className="flex-1 flex overflow-hidden relative">
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleSidebarNavigate}
          canViewModule={canView}
          onLogout={onLogout}
        />


        <main
          key={activeRoute}
          className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 animate-view-popup"
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

          {/* Barra de Pestañas Superiores */}
          <div className="relative z-10 border-b border-border-tan/70 flex items-center justify-between gap-4 animate-pop-in stagger-1">
            <div className="flex items-center gap-6 sm:gap-8">
              <button
                type="button"
                onClick={() => setActiveTab('usuarios')}
                className={`relative font-bold text-[0.95rem] py-2 px-1 pb-3 transition-colors cursor-pointer ${
                  activeTab === 'usuarios'
                    ? 'text-brand after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-brand after:rounded-full'
                    : 'text-text-muted hover:text-brand'
                }`}
              >
                Usuarios
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('roles')}
                className={`relative font-bold text-[0.95rem] py-2 px-1 pb-3 transition-colors cursor-pointer ${
                  activeTab === 'roles'
                    ? 'text-brand after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-brand after:rounded-full'
                    : 'text-text-muted hover:text-brand'
                }`}
              >
                Roles y Permisos
              </button>
            </div>
          </div>

          {/* Contenido Dinámico de la Pestaña Activa */}
          <div key={activeTab} className="relative z-10 animate-view-popup">
            {activeTab === 'usuarios' ? (
              <UsersTab
                users={filteredUsers}
                roles={roles}
                filters={filters}
                onFilterChange={setFilters}
                onOpenCreateModal={openCreateUserModal}
                onOpenEditModal={openEditUserModal}
                onDeleteUser={deleteUser}
                onToggleStatus={toggleUserStatus}
              />
            ) : (
              <RolesPermissionsTab
                roles={roles}
                users={users}
                permissionTarget={permissionTarget}
                onSelectRole={selectRoleTarget}
                onSelectUser={selectUserTarget}
                selectedRole={selectedRole}
                selectedTargetUser={selectedTargetUser}
                activeTargetRole={activeTargetRole}
                activePermissions={activePermissions}
                isUserTargetCustomized={isUserTargetCustomized}
                onResetUserPermissions={resetUserPermissions}
                modulesInfo={modulesInfo}
                onTogglePermission={togglePermission}
                onSavePermissions={saveRolePermissions}
                onOpenCreateRoleDrawer={openCreateRoleModal}
              />
            )}
          </div>
        </main>
      </div>


      {/* Slide-over Drawer para Crear / Editar Usuario */}
      <UserDrawer
        isOpen={isUserModalOpen}
        onClose={closeUserModal}
        onSave={(data) => {
          if (editingUser) {
            updateUser(editingUser.id, data)
          } else {
            createUser(data)
          }
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
