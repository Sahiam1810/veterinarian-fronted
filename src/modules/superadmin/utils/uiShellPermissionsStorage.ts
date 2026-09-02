import type { ModuleId, ModulePermission } from '../types'

// Módulos solo de la UI del panel admin (no existen como filas en MODULES de Oracle)
export const UI_SHELL_MODULE_IDS: ModuleId[] = ['inicio', 'reportes']

const STORAGE_KEY = 'huellitas_ui_shell_permissions'

type UiShellStore = Record<string, Partial<Record<ModuleId, ModulePermission>>>

function readStore(): UiShellStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as UiShellStore
  } catch {
    return {}
  }
}

function writeStore(store: UiShellStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch (err) {
    console.error('No se pudieron guardar permisos de vista UI', err)
  }
}

function scopeKey(scope: 'user' | 'role' | 'email', id: string): string {
  return `${scope}:${id.trim().toLowerCase()}`
}

// Lee excepciones de Inicio/Reportes para un usuario o rol
export function getUiShellOverrides(
  scope: 'user' | 'role' | 'email',
  id: string,
): Partial<Record<ModuleId, ModulePermission>> {
  if (!id) return {}
  const entry = readStore()[scopeKey(scope, id)]
  if (!entry) return {}
  const out: Partial<Record<ModuleId, ModulePermission>> = {}
  for (const modId of UI_SHELL_MODULE_IDS) {
    if (entry[modId]) out[modId] = entry[modId]
  }
  return out
}

// Une excepciones por personId, accountId y email (el último que tenga dato gana)
export function resolveUiShellOverrides(options: {
  personId?: string
  accountId?: string
  email?: string
  roleId?: string
}): Partial<Record<ModuleId, ModulePermission>> {
  const merged: Partial<Record<ModuleId, ModulePermission>> = {}

  if (options.roleId) {
    Object.assign(merged, getUiShellOverrides('role', options.roleId))
  }
  if (options.personId) {
    Object.assign(merged, getUiShellOverrides('user', options.personId))
  }
  if (options.accountId) {
    Object.assign(merged, getUiShellOverrides('user', options.accountId))
  }
  if (options.email) {
    Object.assign(merged, getUiShellOverrides('email', options.email))
  }

  return merged
}

// Guarda excepciones de Inicio/Reportes (merge parcial)
export function setUiShellOverrides(
  scope: 'user' | 'role' | 'email',
  id: string,
  overrides: Partial<Record<ModuleId, ModulePermission>>,
): void {
  if (!id) return
  const store = readStore()
  const key = scopeKey(scope, id)
  const current = { ...(store[key] || {}) }
  for (const modId of UI_SHELL_MODULE_IDS) {
    if (overrides[modId]) {
      current[modId] = overrides[modId]
    }
  }
  store[key] = current
  writeStore(store)
}

// Guarda para personId y email (así el login las encuentra aunque cambie el id de sesión)
export function setUserUiShellOverrides(
  user: { id: string; email?: string },
  overrides: Partial<Record<ModuleId, ModulePermission>>,
): void {
  setUiShellOverrides('user', user.id, overrides)
  if (user.email) {
    setUiShellOverrides('email', user.email, overrides)
  }
}

// Quita excepciones UI de un usuario (vuelve al rol)
export function clearUiShellOverrides(
  scope: 'user' | 'role' | 'email',
  id: string,
): void {
  if (!id) return
  const store = readStore()
  delete store[scopeKey(scope, id)]
  writeStore(store)
}

export function clearUserUiShellOverrides(user: { id: string; email?: string }): void {
  clearUiShellOverrides('user', user.id)
  if (user.email) clearUiShellOverrides('email', user.email)
}

export function isUiShellModule(moduleId: ModuleId): boolean {
  return UI_SHELL_MODULE_IDS.includes(moduleId)
}
