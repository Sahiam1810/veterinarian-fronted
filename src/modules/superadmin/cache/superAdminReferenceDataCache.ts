// Caché en memoria de catálogos SuperAdmin que casi no cambian (S26).
// Sobrevive al desmontaje de pantallas; TTL corto + invalidación tras mutaciones.

export type SuperAdminReferenceDataKey =
  | 'species'
  | 'races'
  | 'specialties'
  | 'roles'
  | 'modules'
  | 'users'

type CacheEntry<T> = {
  data: T
  fetchedAt: number
}

const DEFAULT_TTL_MS = 60_000

const store = new Map<SuperAdminReferenceDataKey, CacheEntry<unknown>>()
const inflight = new Map<SuperAdminReferenceDataKey, Promise<unknown>>()

export function getReferenceDataTtlMs(): number {
  return DEFAULT_TTL_MS
}

// Vacía toda la caché (p. ej. al cerrar sesión).
export function invalidateAllReferenceData(): void {
  store.clear()
  inflight.clear()
}

// Invalida una clave concreta tras crear/editar/borrar ese catálogo.
export function invalidateReferenceData(key: SuperAdminReferenceDataKey): void {
  store.delete(key)
  inflight.delete(key)
}

export function peekReferenceData<T>(key: SuperAdminReferenceDataKey): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined
  return entry?.data
}

// Devuelve datos vigentes o ejecuta loader una sola vez (dedupe concurrente).
export async function getCachedReferenceData<T>(
  key: SuperAdminReferenceDataKey,
  loader: () => Promise<T>,
  options?: {
    ttlMs?: number
    now?: () => number
  },
): Promise<T> {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS
  const now = options?.now ?? Date.now
  const existing = store.get(key) as CacheEntry<T> | undefined

  if (existing && now() - existing.fetchedAt < ttlMs) {
    return existing.data
  }

  const pending = inflight.get(key) as Promise<T> | undefined
  if (pending) {
    return pending
  }

  const loadPromise = (async () => {
    const data = await loader()
    store.set(key, { data, fetchedAt: now() })
    return data
  })()

  inflight.set(key, loadPromise)
  try {
    return await loadPromise
  } finally {
    inflight.delete(key)
  }
}
