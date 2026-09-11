import {
  fetchModules as fetchModulesRaw,
} from '../services/superAdminModulesService'
import {
  fetchRaces as fetchRacesRaw,
  fetchSpecialties as fetchSpecialtiesRaw,
  fetchSpecies as fetchSpeciesRaw,
} from '../services/superAdminCatalogService'
import { fetchRoles as fetchRolesRaw } from '../services/superAdminRolesService'
import { fetchUsers as fetchUsersRaw } from '../services/superAdminUserService'
import {
  getCachedReferenceData,
  invalidateReferenceData,
  type SuperAdminReferenceDataKey,
} from './superAdminReferenceDataCache'

export {
  getCachedReferenceData,
  invalidateAllReferenceData,
  invalidateReferenceData,
  peekReferenceData,
  getReferenceDataTtlMs,
  type SuperAdminReferenceDataKey,
} from './superAdminReferenceDataCache'

// Wrappers con caché compartida entre pantallas SuperAdmin.
export function fetchSpeciesCached() {
  return getCachedReferenceData('species', fetchSpeciesRaw)
}

export function fetchRacesCached(speciesId?: string) {
  // Filtro por especie: no compartir caché del listado completo.
  if (speciesId) {
    return fetchRacesRaw(speciesId)
  }
  return getCachedReferenceData('races', () => fetchRacesRaw())
}

export function fetchSpecialtiesCached() {
  return getCachedReferenceData('specialties', fetchSpecialtiesRaw)
}

export function fetchRolesCached() {
  return getCachedReferenceData('roles', fetchRolesRaw)
}

export function fetchModulesCached() {
  return getCachedReferenceData('modules', fetchModulesRaw)
}

export function fetchUsersCached() {
  return getCachedReferenceData('users', fetchUsersRaw)
}

export function invalidateCatalogKey(key: SuperAdminReferenceDataKey): void {
  invalidateReferenceData(key)
}
