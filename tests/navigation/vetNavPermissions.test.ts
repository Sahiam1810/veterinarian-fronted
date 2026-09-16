import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import { fetchVetNavPermissions } from '../../src/modules/veterinario/services/vetNavPermissionsService.ts'
import {
  filterNavKeysByModuleView,
  isNavPermissionGranted,
  RECEP_ALWAYS_VISIBLE_NAV,
  RECEP_MODULE_TO_NAV,
  VET_ALWAYS_VISIBLE_NAV,
  VET_MODULE_TO_NAV,
} from '../../src/modules/auth/services/myPermissionsService.ts'
import { resolveNavCatalog } from '../../src/global/navigation/resolveNav.ts'
import {
  VET_DEFAULT_PERMISSIONS,
  VET_NAV_CATALOG,
} from '../../src/global/navigation/roles/veterinario.ts'
import {
  AUX_ALWAYS_VISIBLE_NAV,
  AUX_MODULE_TO_NAV,
} from '../../src/modules/auth/services/myPermissionsService.ts'
import { AUX_NAV_PERMISSION_KEYS } from '../../src/global/navigation/roles/auxiliar.ts'
import { RECEP_DEFAULT_PERMISSIONS } from '../../src/global/navigation/roles/recepcionista.ts'

const originalFetch = globalThis.fetch

beforeEach(() => {
  // Configurar storage mínimo para simular autenticación activa si apiClient lo requiere
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() { return store.size },
    clear() { store.clear() },
    getItem(key) { return store.get(key) ?? null },
    key(index) { return [...store.keys()][index] ?? null },
    removeItem(key) { store.delete(key) },
    setItem(key, value) { store.set(key, value) },
  }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memoryStorage })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: memoryStorage })
  localStorage.setItem('huellitas_auth_tokens', JSON.stringify({
    accessToken: 'test-token',
    accessTokenExpiresAt: '2099-01-01T00:00:00Z',
    refreshToken: 'test-refresh',
  }))
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('fetchVetNavPermissions returns all nav keys when all modules have canView = true', async () => {
  globalThis.fetch = async () => {
    return Response.json({
      permissions: {
        Mascotas: { canView: true, canCreate: true, canEdit: true, canDelete: false },
        Citas: { canView: true, canCreate: false, canEdit: true, canDelete: false },
      },
    })
  }

  const permissions = await fetchVetNavPermissions()
  assert.ok(permissions)
  if (!permissions) return
  assert.deepEqual(permissions, ['vet.inicio', 'vet.agenda', 'vet.mascotas', 'vet.perfil'])
  assert.equal(isNavPermissionGranted(permissions, 'vet.agenda'), true)
  assert.equal(isNavPermissionGranted(permissions, 'vet.mascotas'), true)
})

test('fetchVetNavPermissions filters out vet.agenda when Citas canView is false', async () => {
  globalThis.fetch = async () => {
    return Response.json({
      permissions: {
        Mascotas: { canView: true, canCreate: false, canEdit: false, canDelete: false },
        Citas: { canView: false, canCreate: false, canEdit: false, canDelete: false },
      },
    })
  }

  const permissions = await fetchVetNavPermissions()
  assert.ok(permissions)
  if (!permissions) return
  assert.equal(permissions.includes('vet.agenda'), false)
  assert.equal(permissions.includes('vet.mascotas'), true)
  assert.equal(permissions.includes('vet.inicio'), true)
  assert.equal(permissions.includes('vet.perfil'), true)

  // Validar bloqueo en guard de navegación
  assert.equal(isNavPermissionGranted(permissions, 'vet.agenda'), false)
  assert.equal(isNavPermissionGranted(permissions, 'vet.mascotas'), true)

  // Validar que el sidebar oculta el ítem de Agenda
  const visibleItems = resolveNavCatalog(VET_NAV_CATALOG, VET_DEFAULT_PERMISSIONS, permissions)
  const itemIds = visibleItems.map((item) => item.id)
  assert.equal(itemIds.includes('agenda'), false)
  assert.equal(itemIds.includes('mascotas'), true)
  assert.equal(itemIds.includes('inicio'), true)
})

test('fetchVetNavPermissions filters out vet.mascotas when Mascotas canView is false', async () => {
  globalThis.fetch = async () => {
    return Response.json({
      permissions: {
        Mascotas: { canView: false, canCreate: false, canEdit: false, canDelete: false },
        Citas: { canView: true, canCreate: false, canEdit: true, canDelete: false },
      },
    })
  }

  const permissions = await fetchVetNavPermissions()
  assert.ok(permissions)
  if (!permissions) return
  assert.equal(permissions.includes('vet.mascotas'), false)
  assert.equal(permissions.includes('vet.agenda'), true)
  assert.equal(isNavPermissionGranted(permissions, 'vet.mascotas'), false)
  assert.equal(isNavPermissionGranted(permissions, 'vet.agenda'), true)

  const visibleItems = resolveNavCatalog(VET_NAV_CATALOG, VET_DEFAULT_PERMISSIONS, permissions)
  const itemIds = visibleItems.map((item) => item.id)
  assert.equal(itemIds.includes('mascotas'), false)
  assert.equal(itemIds.includes('agenda'), true)
})

test('fetchVetNavPermissions falls back to VET_ALWAYS_VISIBLE_NAV on network/auth error', async () => {
  globalThis.fetch = async () => {
    return new Response('Internal Server Error', { status: 500 })
  }

  const permissions = await fetchVetNavPermissions()
  assert.ok(permissions)
  if (!permissions) return
  assert.deepEqual(
    permissions,
    VET_ALWAYS_VISIBLE_NAV.filter((k) => VET_DEFAULT_PERMISSIONS.includes(k)),
  )
  assert.equal(permissions.includes('vet.agenda'), false)
  assert.equal(permissions.includes('vet.mascotas'), false)
  assert.equal(permissions.includes('vet.inicio'), true)
  assert.equal(permissions.includes('vet.perfil'), true)
})

test('filterNavKeysByModuleView correctly handles empty permissions map', () => {
  const filtered = filterNavKeysByModuleView(
    VET_DEFAULT_PERMISSIONS,
    {},
    VET_MODULE_TO_NAV,
    VET_ALWAYS_VISIBLE_NAV,
  )
  assert.deepEqual(filtered, ['vet.inicio', 'vet.perfil'])
})

test('auxiliary navigation adds a module disabled by default when the API grants View', () => {
  const permissions = filterNavKeysByModuleView(
    AUX_NAV_PERMISSION_KEYS,
    {
      Usuarios: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      Mascotas: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      Citas: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      Clientes: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    },
    AUX_MODULE_TO_NAV,
    AUX_ALWAYS_VISIBLE_NAV,
  )

  assert.equal(permissions.includes('aux.usuarios'), true)
  assert.equal(permissions.includes('aux.mascotas'), true)
  assert.equal(permissions.includes('aux.agenda'), true)
  assert.equal(permissions.includes('aux.duenos'), false)
  assert.equal(permissions.includes('aux.inicio'), true)
  assert.equal(permissions.includes('aux.perfil'), true)
})

test('filterNavKeysByModuleView oculta Asesor si falta Chat o Escalamientos', () => {
  const withBoth = filterNavKeysByModuleView(
    RECEP_DEFAULT_PERMISSIONS,
    {
      Clientes: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      Mascotas: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      Citas: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      Chat: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      Escalamientos: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    },
    RECEP_MODULE_TO_NAV,
    RECEP_ALWAYS_VISIBLE_NAV,
  )
  assert.equal(withBoth.includes('recep.conversaciones'), true)

  const withoutChat = filterNavKeysByModuleView(
    RECEP_DEFAULT_PERMISSIONS,
    {
      Clientes: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      Mascotas: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      Citas: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      Escalamientos: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    },
    RECEP_MODULE_TO_NAV,
    RECEP_ALWAYS_VISIBLE_NAV,
  )
  assert.equal(withoutChat.includes('recep.conversaciones'), false)
})
