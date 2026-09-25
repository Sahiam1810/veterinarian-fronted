import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyMascotasSettledResults,
  applyOwnersRetryPreserveCatalogs,
  assertMascotaFormCatalogsOpen,
  assertMascotaSubmitCatalogs,
  getSpeciesSelectPlaceholder,
  resolveCatalogResourceError,
  statusFromListResult,
} from '../../src/modules/superadmin/hooks/mascotasLoadHelpers.ts'
import type { ApiClientResponse } from '../../src/modules/superadmin/services/superAdminClientsService.ts'
import type { ApiPetResponse } from '../../src/modules/superadmin/services/superAdminPetsService.ts'
import type { ApiClientPetResponse } from '../../src/modules/superadmin/services/superAdminClientsPetsService.ts'
import type {
  ApiRaceResponse,
  ApiSpeciesResponse,
} from '../../src/modules/superadmin/services/superAdminCatalogService.ts'

/**
 * Diseño de pruebas:
 * node:test no resuelve el alias `@/` de superAdminPetsService ni carga apiClient/env
 * de forma fiable al importar el hook completo. Por eso se prueba el helper puro
 * `applyMascotasSettledResults` (mismo apply que consume Promise.allSettled en el hook)
 * con PromiseSettledResult sintéticos — sin ocultar el orden de aplicación.
 */

const speciesOk: ApiSpeciesResponse[] = [{ id: 's1', name: 'Canino' }]
const racesOk: ApiRaceResponse[] = [{ id: 'r1', name: 'Mestizo', speciesId: 's1' }]
const clientsOk: ApiClientResponse[] = [
  {
    id: 'c1',
    identificationNumber: '123',
    phoneNumber: '300',
    address: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: null,
    fullName: 'Ana Pérez',
    email: 'ana@test.com',
    isActive: true,
  },
]
const petsOk: ApiPetResponse[] = [
  {
    id: 'p1',
    name: 'Firulais',
    age: 3,
    gender: 'Male',
    weight: 12,
    observations: null,
    speciesId: 's1',
    raceId: 'r1',
    photoUrl: null,
  },
]
const clientsPetsOk: ApiClientPetResponse[] = [
  {
    id: 'cp1',
    clientId: 'c1',
    petId: 'p1',
    isPrimaryOwner: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: null,
  },
]

function rejected(status: number, message = 'err'): PromiseRejectedResult {
  return {
    status: 'rejected',
    reason: Object.assign(new Error(message), { status, name: 'ApiError' }),
  }
}

function fulfilled<T>(value: T): PromiseFulfilledResult<T> {
  return { status: 'fulfilled', value }
}

function loadBundle(opts: {
  clients?: PromiseSettledResult<ApiClientResponse[]>
  pets?: PromiseSettledResult<ApiPetResponse[]>
  clientsPets?: PromiseSettledResult<ApiClientPetResponse[]>
  species?: PromiseSettledResult<ApiSpeciesResponse[]>
  races?: PromiseSettledResult<ApiRaceResponse[]>
}) {
  return applyMascotasSettledResults(
    opts.clients ?? fulfilled(clientsOk),
    opts.pets ?? fulfilled(petsOk),
    opts.clientsPets ?? fulfilled(clientsPetsOk),
    opts.species ?? fulfilled(speciesOk),
    opts.races ?? fulfilled(racesOk),
  )
}

test('1. Clients 500 + Species/Races 200: catálogos ready; owners error 500', () => {
  const bundle = loadBundle({ clients: rejected(500) })

  assert.equal(bundle.speciesStatus, 'ready')
  assert.equal(bundle.racesStatus, 'ready')
  assert.equal(bundle.speciesOptions.length, 1)
  assert.equal(bundle.raceOptions.length, 1)
  assert.equal(bundle.ownersStatus, 'error')
  assert.ok(bundle.ownersError?.includes('servidor') || bundle.ownersError?.includes('dueños'))
  assert.equal(bundle.duenos.length, 0)
  assert.notEqual(bundle.speciesStatus, 'empty')
})

test('2. Clients 403 + Species/Races 200: catálogos ready; owners permiso', () => {
  const bundle = loadBundle({ clients: rejected(403) })

  assert.equal(bundle.speciesStatus, 'ready')
  assert.equal(bundle.racesStatus, 'ready')
  assert.equal(bundle.ownersStatus, 'error')
  assert.ok(bundle.ownersError?.toLowerCase().includes('permiso'))
})

test('3. Clients 401 + Species/Races 200: catálogos ready; owners sesión', () => {
  const bundle = loadBundle({ clients: rejected(401) })

  assert.equal(bundle.speciesStatus, 'ready')
  assert.equal(bundle.racesStatus, 'ready')
  assert.equal(bundle.ownersStatus, 'error')
  assert.ok(
    bundle.ownersError?.toLowerCase().includes('sesión') ||
      bundle.ownersError?.toLowerCase().includes('autoriz'),
  )
})

test('4. Species 500: species error (no empty); guard impide abrir/guardar', () => {
  const bundle = loadBundle({ species: rejected(500) })

  assert.equal(bundle.speciesStatus, 'error')
  assert.notEqual(bundle.speciesStatus, 'empty')
  assert.ok(bundle.speciesError)
  assert.equal(bundle.speciesOptions.length, 0)

  const openGuard = assertMascotaFormCatalogsOpen(bundle.speciesStatus, bundle.racesStatus)
  assert.equal(openGuard.ok, false)
  if (!openGuard.ok) assert.ok(openGuard.message.toLowerCase().includes('especies'))

  const submitGuard = assertMascotaSubmitCatalogs(
    bundle.speciesStatus,
    bundle.racesStatus,
    'ready',
    1,
  )
  assert.equal(submitGuard.ok, false)
})

test('5. Races 500: races error (no empty); guard correspondiente', () => {
  const bundle = loadBundle({ races: rejected(500) })

  assert.equal(bundle.racesStatus, 'error')
  assert.notEqual(bundle.racesStatus, 'empty')
  assert.ok(bundle.racesError)

  const openGuard = assertMascotaFormCatalogsOpen(bundle.speciesStatus, bundle.racesStatus)
  assert.equal(openGuard.ok, false)
  if (!openGuard.ok) assert.ok(openGuard.message.toLowerCase().includes('razas'))
})

test('6. Species []: empty sin error', () => {
  const bundle = loadBundle({ species: fulfilled([]) })

  assert.equal(bundle.speciesStatus, 'empty')
  assert.equal(bundle.speciesError, null)
  assert.equal(bundle.speciesOptions.length, 0)
})

test('7. Races []: empty sin error', () => {
  const bundle = loadBundle({ races: fulfilled([]) })

  assert.equal(bundle.racesStatus, 'empty')
  assert.equal(bundle.racesError, null)
  assert.equal(bundle.raceOptions.length, 0)
})

test('8. Todo 200: ready y flujo de datos normal', () => {
  const bundle = loadBundle({})

  assert.equal(bundle.speciesStatus, 'ready')
  assert.equal(bundle.racesStatus, 'ready')
  assert.equal(bundle.ownersStatus, 'ready')
  assert.equal(bundle.speciesOptions[0]?.name, 'Canino')
  assert.equal(bundle.raceOptions[0]?.name, 'Mestizo')
  assert.equal(bundle.duenos[0]?.name, 'Ana Pérez')
  assert.equal(bundle.mascotas[0]?.name, 'Firulais')
  assert.equal(bundle.mascotas[0]?.ownerName, 'Ana Pérez')
  assert.equal(bundle.ownersError, null)
  assert.equal(bundle.speciesError, null)
  assert.equal(bundle.racesError, null)
})

test('9. Retry owners: Clients 500 luego 200; species/races ready no se vacían', () => {
  const first = loadBundle({ clients: rejected(500) })
  assert.equal(first.speciesStatus, 'ready')
  assert.equal(first.racesStatus, 'ready')
  assert.equal(first.ownersStatus, 'error')

  const afterRetry = applyOwnersRetryPreserveCatalogs(first, fulfilled(clientsOk))

  assert.equal(afterRetry.ownersStatus, 'ready')
  assert.equal(afterRetry.ownersError, null)
  assert.equal(afterRetry.duenos.length, 1)
  assert.deepEqual(afterRetry.speciesOptions, first.speciesOptions)
  assert.deepEqual(afterRetry.raceOptions, first.raceOptions)
  assert.equal(afterRetry.speciesStatus, 'ready')
  assert.equal(afterRetry.racesStatus, 'ready')
  assert.notEqual(afterRetry.speciesStatus, 'loading')
  assert.notEqual(afterRetry.speciesStatus, 'empty')
})

test('guardas UI: no guardar sin Species/Races ready; sin texto Sin especies en API', () => {
  assert.equal(assertMascotaFormCatalogsOpen('error', 'ready').ok, false)
  assert.equal(assertMascotaFormCatalogsOpen('ready', 'error').ok, false)
  assert.equal(assertMascotaFormCatalogsOpen('empty', 'ready').ok, false)
  assert.equal(assertMascotaFormCatalogsOpen('ready', 'ready').ok, true)

  assert.equal(assertMascotaSubmitCatalogs('ready', 'ready', 'error', 0).ok, false)
  assert.equal(assertMascotaSubmitCatalogs('ready', 'ready', 'ready', 0).ok, false)
  assert.equal(assertMascotaSubmitCatalogs('ready', 'ready', 'ready', 2).ok, true)

  const withData = loadBundle({ clients: rejected(500) })
  assert.equal(withData.speciesOptions.length, 1)
  assert.ok(!getSpeciesSelectPlaceholder('error').includes('Sin especies en API'))
  assert.ok(!getSpeciesSelectPlaceholder('empty').includes('Sin especies en API'))
  assert.equal(getSpeciesSelectPlaceholder('error'), 'Catálogo de especies no disponible')
  assert.equal(getSpeciesSelectPlaceholder('empty'), 'No hay especies registradas.')
})

test('statusFromListResult distingue empty de error', () => {
  const empty = statusFromListResult<ApiSpeciesResponse[]>(fulfilled([]), 'species')
  assert.equal(empty.status, 'empty')
  assert.equal(empty.error, null)

  const errored = statusFromListResult<ApiSpeciesResponse[]>(rejected(500), 'species')
  assert.equal(errored.status, 'error')
  assert.ok(errored.error)
})

test('resolveCatalogResourceError: mensajes 401/403/500/red por recurso', () => {
  assert.ok(resolveCatalogResourceError('owners', { status: 401 }).includes('Sesión'))
  assert.ok(resolveCatalogResourceError('owners', { status: 403 }).includes('permiso'))
  assert.ok(resolveCatalogResourceError('owners', { status: 500 }).includes('servidor'))
  assert.ok(resolveCatalogResourceError('owners', { status: 0 }).includes('conectar'))
  assert.ok(resolveCatalogResourceError('species', { status: 500 }).includes('especies'))
  assert.ok(resolveCatalogResourceError('races', { status: 403 }).includes('razas'))
})
