import assert from 'node:assert/strict'
import test from 'node:test'

import { buildViewMap } from '../../src/modules/superadmin/utils/buildAdminShellViewMap.ts'
import {
  clearUiShellOverrides,
  setUiShellOverrides,
} from '../../src/modules/superadmin/utils/uiShellPermissionsStorage.ts'

// localStorage mínimo para overrides UI en node --test
function installMemoryLocalStorage() {
  const store = new Map<string, string>()
  const memory = {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
    removeItem(key: string) {
      store.delete(key)
    },
    clear() {
      store.clear()
    },
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: memory,
    configurable: true,
  })
  return memory
}

const baseOptions = {
  personId: 'person-1',
  email: 'vet@veterinaria.com',
  roleId: '44444444-4444-4444-4444-444444444444',
}

test('sin fila Reportes en apiPermissions → viewMap.reportes === false', () => {
  installMemoryLocalStorage()
  const views = buildViewMap(
    {
      Usuarios: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      Citas: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    },
    baseOptions,
  )
  assert.equal(views.reportes, false)
  assert.equal(views.usuarios, true)
  assert.equal(views.agenda, true)
})

test('apiPermissions Reportes.canView === true → viewMap.reportes === true', () => {
  installMemoryLocalStorage()
  const views = buildViewMap(
    {
      Reportes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    },
    baseOptions,
  )
  assert.equal(views.reportes, true)
})

test('isPlatformSuperAdmin → reportes true sin depender de apiPermissions', () => {
  installMemoryLocalStorage()
  const views = buildViewMap(
    {
      Reportes: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    },
    { ...baseOptions, isPlatformSuperAdmin: true },
  )
  assert.equal(views.reportes, true)
  assert.equal(views.usuarios, true)
})

test('override UI de reportes gana sobre el valor de la API', () => {
  installMemoryLocalStorage()
  setUiShellOverrides('user', baseOptions.personId, {
    reportes: { view: true, create: false, edit: false, delete: false },
  })

  const viewsForcedOn = buildViewMap(
    {
      Reportes: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    },
    baseOptions,
  )
  assert.equal(viewsForcedOn.reportes, true)

  setUiShellOverrides('user', baseOptions.personId, {
    reportes: { view: false, create: false, edit: false, delete: false },
  })
  const viewsForcedOff = buildViewMap(
    {
      Reportes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    },
    baseOptions,
  )
  assert.equal(viewsForcedOff.reportes, false)

  clearUiShellOverrides('user', baseOptions.personId)
})
