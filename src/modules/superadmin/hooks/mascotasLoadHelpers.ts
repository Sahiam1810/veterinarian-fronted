/**
 * Helpers puros del load de Mascotas SuperAdmin.
 * Separados del hook para poder probar allSettled/guards en node:test
 * sin importar servicios con alias `@/` ni apiClient/env.
 */
import type { SuperAdminDueno, SuperAdminMascota } from '../types/mascotasSuperAdmin.types.ts'
import type { ApiClientResponse } from '../services/superAdminClientsService.ts'
import type { ApiPetResponse } from '../services/superAdminPetsService.ts'
import type { ApiClientPetResponse } from '../services/superAdminClientsPetsService.ts'
import type {
  ApiRaceResponse,
  ApiSpeciesResponse,
} from '../services/superAdminCatalogService.ts'
import { mapClientToDueno, mapPetToMascota } from '../utils/superAdminApiMappers.ts'

/** Estado de carga por recurso (catálogos / dueños). */
export type CatalogResourceStatus = 'loading' | 'ready' | 'empty' | 'error'

export type MascotasCatalogResource = 'owners' | 'species' | 'races'

export interface MascotasLoadBundle {
  speciesOptions: { id: string; name: string }[]
  raceOptions: { id: string; name: string; speciesId: string }[]
  speciesStatus: Exclude<CatalogResourceStatus, 'loading'>
  speciesError: string | null
  racesStatus: Exclude<CatalogResourceStatus, 'loading'>
  racesError: string | null
  ownersStatus: Exclude<CatalogResourceStatus, 'loading'>
  ownersError: string | null
  petsError: string | null
  clientsPetsError: string | null
  duenos: SuperAdminDueno[]
  mascotas: SuperAdminMascota[]
}

function readErrorStatus(err: unknown): number {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = (err as { status: unknown }).status
    if (typeof status === 'number') return status
  }
  return -1
}

function readErrorMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return null
}

function messageForStatus(resource: MascotasCatalogResource, status: number): string {
  if (resource === 'owners') {
    if (status === 401) return 'Sesión expirada o no autorizado al cargar dueños.'
    if (status === 403) return 'No tienes permiso para ver dueños.'
    if (status >= 500) return 'Error del servidor al cargar dueños.'
    if (status === 0) return 'No se pudo conectar al cargar dueños.'
    return 'No se pudieron cargar los dueños.'
  }
  if (resource === 'species') {
    if (status === 401) return 'Sesión expirada o no autorizado al cargar especies.'
    if (status === 403) return 'No tienes permiso para ver el catálogo de especies.'
    if (status >= 500) return 'Error del servidor al cargar el catálogo de especies.'
    if (status === 0) return 'No se pudo conectar al cargar el catálogo de especies.'
    return 'No fue posible cargar el catálogo de especies.'
  }
  if (status === 401) return 'Sesión expirada o no autorizado al cargar razas.'
  if (status === 403) return 'No tienes permiso para ver el catálogo de razas.'
  if (status >= 500) return 'Error del servidor al cargar el catálogo de razas.'
  if (status === 0) return 'No se pudo conectar al cargar el catálogo de razas.'
  return 'No fue posible cargar el catálogo de razas.'
}

/** Mensaje de error aislado por recurso (401/403/500/red). */
export function resolveCatalogResourceError(
  resource: MascotasCatalogResource,
  err: unknown,
): string {
  return messageForStatus(resource, readErrorStatus(err))
}

/** Deriva ready/empty/error desde un PromiseSettledResult de lista. */
export function statusFromListResult<T>(
  result: PromiseSettledResult<T[]>,
  resource: MascotasCatalogResource,
): {
  status: Exclude<CatalogResourceStatus, 'loading'>
  items: T[]
  error: string | null
} {
  if (result.status === 'fulfilled') {
    const items = result.value
    return {
      status: items.length > 0 ? 'ready' : 'empty',
      items,
      error: null,
    }
  }
  return {
    status: 'error',
    items: [],
    error: resolveCatalogResourceError(resource, result.reason),
  }
}

/**
 * Aplica cada resultado de allSettled de forma independiente.
 * Un rechazo de Clients NO impide persistir Species/Races fulfilled.
 */
export function applyMascotasSettledResults(
  clientsResult: PromiseSettledResult<ApiClientResponse[]>,
  petsResult: PromiseSettledResult<ApiPetResponse[]>,
  clientsPetsResult: PromiseSettledResult<ApiClientPetResponse[]>,
  speciesResult: PromiseSettledResult<ApiSpeciesResponse[]>,
  racesResult: PromiseSettledResult<ApiRaceResponse[]>,
): MascotasLoadBundle {
  const speciesSettled = statusFromListResult(speciesResult, 'species')
  const racesSettled = statusFromListResult(racesResult, 'races')
  const ownersSettled = statusFromListResult(clientsResult, 'owners')

  const pets =
    petsResult.status === 'fulfilled' ? petsResult.value : ([] as ApiPetResponse[])
  const clientsPets =
    clientsPetsResult.status === 'fulfilled'
      ? clientsPetsResult.value
      : ([] as ApiClientPetResponse[])
  const petsError =
    petsResult.status === 'rejected'
      ? readErrorMessage(petsResult.reason) ?? 'No se pudieron cargar las mascotas.'
      : null
  const clientsPetsError =
    clientsPetsResult.status === 'rejected'
      ? readErrorMessage(clientsPetsResult.reason) ??
        'No se pudieron cargar los vínculos mascota-dueño.'
      : null

  const species = speciesSettled.items
  const races = racesSettled.items
  const clients = ownersSettled.items

  const speciesOptions = species.map((s) => ({ id: s.id, name: s.name }))
  const raceOptions = races.map((r) => ({
    id: r.id,
    name: r.name,
    speciesId: r.speciesId,
  }))

  const normId = (id: string) => id.toLowerCase()
  const speciesById = new Map(species.map((s) => [normId(s.id), s.name]))
  const racesById = new Map(races.map((r) => [normId(r.id), r.name]))
  const petsById = new Map(pets.map((p) => [normId(p.id), p]))

  const duenosMapped = clients.map((client) => {
    const petLinks = clientsPets.filter((cp) => normId(cp.clientId) === normId(client.id))
    const summary = petLinks
      .map((link) => {
        const pet = petsById.get(normId(link.petId))
        if (!pet) return null
        const speciesName = speciesById.get(normId(pet.speciesId)) ?? ''
        return `${pet.name} (${mapPetToMascota({ pet, speciesName }).species})`
      })
      .filter((s): s is string => Boolean(s))
    return mapClientToDueno(client, summary)
  })

  const duenosById = new Map(duenosMapped.map((d) => [normId(d.id), d]))
  const clientPetByPetId = new Map<string, ApiClientPetResponse>()
  for (const cp of clientsPets) {
    const key = normId(cp.petId)
    const prev = clientPetByPetId.get(key)
    if (!prev || (cp.isPrimaryOwner && !prev.isPrimaryOwner)) {
      clientPetByPetId.set(key, cp)
    }
  }

  const mascotasMapped = pets.map((pet) => {
    const clientPet = clientPetByPetId.get(normId(pet.id))
    const owner = clientPet ? duenosById.get(normId(clientPet.clientId)) : undefined
    return mapPetToMascota({
      pet,
      clientPet,
      owner,
      speciesName: speciesById.get(normId(pet.speciesId)),
      raceName: racesById.get(normId(pet.raceId)),
    })
  })

  return {
    speciesOptions,
    raceOptions,
    speciesStatus: speciesSettled.status,
    speciesError: speciesSettled.error,
    racesStatus: racesSettled.status,
    racesError: racesSettled.error,
    ownersStatus: ownersSettled.status,
    ownersError: ownersSettled.error,
    petsError,
    clientsPetsError,
    duenos: duenosMapped,
    mascotas: mascotasMapped,
  }
}

/**
 * Simula el efecto de retryOwners: actualiza solo dueños,
 * preservando species/races del bundle previo.
 */
export function applyOwnersRetryPreserveCatalogs(
  previous: Pick<
    MascotasLoadBundle,
    'speciesOptions' | 'raceOptions' | 'speciesStatus' | 'racesStatus' | 'speciesError' | 'racesError'
  >,
  ownersResult: PromiseSettledResult<ApiClientResponse[]>,
): {
  ownersStatus: Exclude<CatalogResourceStatus, 'loading'>
  ownersError: string | null
  duenos: SuperAdminDueno[]
  speciesOptions: MascotasLoadBundle['speciesOptions']
  raceOptions: MascotasLoadBundle['raceOptions']
  speciesStatus: MascotasLoadBundle['speciesStatus']
  racesStatus: MascotasLoadBundle['racesStatus']
} {
  const ownersSettled = statusFromListResult(ownersResult, 'owners')
  return {
    ownersStatus: ownersSettled.status,
    ownersError: ownersSettled.error,
    duenos: ownersSettled.items.map((c) => mapClientToDueno(c, [])),
    speciesOptions: previous.speciesOptions,
    raceOptions: previous.raceOptions,
    speciesStatus: previous.speciesStatus,
    racesStatus: previous.racesStatus,
  }
}

/** Guarda de apertura de formulario: Species y Races deben estar ready. */
export function assertMascotaFormCatalogsOpen(
  speciesStatus: CatalogResourceStatus,
  racesStatus: CatalogResourceStatus,
): { ok: true } | { ok: false; message: string } {
  if (speciesStatus === 'loading') {
    return { ok: false, message: 'Cargando especies… Espera un momento.' }
  }
  if (speciesStatus === 'error') {
    return {
      ok: false,
      message: 'No fue posible cargar el catálogo de especies. Reintenta antes de continuar.',
    }
  }
  if (speciesStatus === 'empty') {
    return {
      ok: false,
      message: 'No hay especies registradas. Configura el catálogo antes de registrar mascotas.',
    }
  }
  if (racesStatus === 'loading') {
    return { ok: false, message: 'Cargando razas… Espera un momento.' }
  }
  if (racesStatus === 'error') {
    return {
      ok: false,
      message: 'No fue posible cargar el catálogo de razas. Reintenta antes de continuar.',
    }
  }
  if (racesStatus === 'empty') {
    return {
      ok: false,
      message: 'No hay razas registradas. Configura el catálogo antes de registrar mascotas.',
    }
  }
  return { ok: true }
}

/** Guarda de submit: catálogos ready + dueños ready con al menos uno. */
export function assertMascotaSubmitCatalogs(
  speciesStatus: CatalogResourceStatus,
  racesStatus: CatalogResourceStatus,
  ownersStatus: CatalogResourceStatus,
  ownersCount: number,
): { ok: true } | { ok: false; message: string } {
  const openGuard = assertMascotaFormCatalogsOpen(speciesStatus, racesStatus)
  if (!openGuard.ok) return openGuard

  if (ownersStatus === 'loading') {
    return { ok: false, message: 'Cargando dueños… Espera un momento.' }
  }
  if (ownersStatus === 'error') {
    return {
      ok: false,
      message: 'No fue posible cargar los dueños. Reintenta antes de guardar la mascota.',
    }
  }
  if (ownersStatus === 'empty' || ownersCount === 0) {
    return {
      ok: false,
      message: 'No hay dueños disponibles. Registra un dueño antes de guardar la mascota.',
    }
  }
  return { ok: true }
}

/**
 * Etiqueta del select de especies cuando no hay opciones.
 * Nunca usa “Sin especies en API” para errores (evita falso vacío).
 */
export function getSpeciesSelectPlaceholder(status: CatalogResourceStatus): string {
  if (status === 'loading') return 'Cargando especies…'
  if (status === 'error') return 'Catálogo de especies no disponible'
  if (status === 'empty') return 'No hay especies registradas.'
  return ''
}

export function getRacesUnavailableMessage(
  racesStatus: CatalogResourceStatus,
  hasRacesForSpecies: boolean,
): string | null {
  if (racesStatus === 'loading') return 'Cargando razas…'
  if (racesStatus === 'error') return 'No fue posible cargar el catálogo de razas.'
  if (racesStatus === 'empty') return 'No hay razas registradas.'
  if (!hasRacesForSpecies) return 'No hay razas disponibles para la especie'
  return null
}
