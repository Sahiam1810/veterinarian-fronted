/**
 * Helpers puros del load de Agenda SuperAdmin (shell compartido con Auxiliar).
 * Separados del hook para poder probar la carga tolerante a fallos en node:test
 * sin importar servicios con alias `@/` ni apiClient/env.
 *
 * Solo GET /api/Appointments (Citas.View) es obligatorio. Los catálogos
 * secundarios enriquecen la vista y su fallo nunca bloquea la Agenda.
 */
import type {
  AgendaPetOption,
  AgendaServiceOption,
  CitaSuperAdmin,
} from '../types/agendaSuperAdmin.types.ts'
import type { ApiAppointmentResponse } from '../services/superAdminAppointmentsService.ts'
import type { ApiClientResponse } from '../services/superAdminClientsService.ts'
import type { ApiClientPetResponse } from '../services/superAdminClientsPetsService.ts'
import type { ApiPetResponse } from '../services/superAdminPetsService.ts'
import type { ApiServiceResponse } from '../services/superAdminVetServicesService.ts'
import type { ApiVeterinarianResponse } from '../services/superAdminVeterinariansService.ts'
import type {
  ApiRaceResponse,
  ApiSpeciesResponse,
  ApiStatusAppointmentResponse,
} from '../services/superAdminCatalogService.ts'
import { mapAppointmentToCita } from '../utils/superAdminApiMappers.ts'

export interface AgendaCatalogData {
  veterinarians: ApiVeterinarianResponse[]
  pets: ApiPetResponse[]
  clientsPets: ApiClientPetResponse[]
  clients: ApiClientResponse[]
  species: ApiSpeciesResponse[]
  races: ApiRaceResponse[]
  services: ApiServiceResponse[]
  statuses: ApiStatusAppointmentResponse[]
}

export type AgendaCatalogKey = keyof AgendaCatalogData

export interface AgendaCatalogInfo {
  label: string
  endpoint: string
  permission: string
}

export const AGENDA_CATALOGS: Record<AgendaCatalogKey, AgendaCatalogInfo> = {
  veterinarians: { label: 'Veterinarios', endpoint: '/api/Veterinarians', permission: 'Veterinarios.View' },
  pets: { label: 'Mascotas', endpoint: '/api/Pets', permission: 'Mascotas.View' },
  clientsPets: { label: 'Vínculos mascota-dueño', endpoint: '/api/ClientsPets', permission: 'Mascotas.View' },
  clients: { label: 'Clientes', endpoint: '/api/Clients', permission: 'Clientes.View' },
  species: { label: 'Especies', endpoint: '/api/Species', permission: 'Especies y Razas.View' },
  races: { label: 'Razas', endpoint: '/api/Races', permission: 'Especies y Razas.View' },
  services: { label: 'Servicios', endpoint: '/api/Services', permission: 'Servicios.View' },
  statuses: { label: 'Estados de cita', endpoint: '/api/StatusAppointments', permission: 'Estados de Cita.View' },
}

export const AGENDA_CATALOG_KEYS = Object.keys(AGENDA_CATALOGS) as AgendaCatalogKey[]

/** Textos visibles cuando el dato no llegó (catálogo fallido o registro inexistente). */
export const AGENDA_FALLBACKS = {
  petName: 'Mascota no disponible',
  petBreed: 'Raza no disponible',
  species: 'Especie no disponible',
  ownerName: 'Dueño no disponible',
  professionalName: 'Profesional no disponible',
  service: 'Servicio no disponible',
} as const

export interface AgendaCatalogFailure extends AgendaCatalogInfo {
  key: AgendaCatalogKey
  status: number
  message: string
}

export type AgendaFetchers = {
  appointments: () => Promise<ApiAppointmentResponse[]>
} & { [K in AgendaCatalogKey]: () => Promise<AgendaCatalogData[K]> }

export type AgendaCatalogResults = {
  [K in AgendaCatalogKey]: PromiseSettledResult<AgendaCatalogData[K]>
}

export interface AgendaLoadBundle {
  citas: CitaSuperAdmin[]
  profesionalesOpciones: { id: string; name: string }[]
  serviciosOpciones: AgendaServiceOption[]
  mascotasOpciones: AgendaPetOption[]
  statusCatalog: { id: string; name: string }[]
  catalogFailures: AgendaCatalogFailure[]
}

export type AgendaLoadResult =
  | { ok: true; data: AgendaLoadBundle }
  | { ok: false; status: number; error: string }

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

/** Error bloqueante: solo aplica al GET de citas (Citas.View). */
export function resolveAgendaAppointmentsError(err: unknown): string {
  const status = readErrorStatus(err)
  if (status === 403) return 'No tienes permisos para ver la agenda (requiere Citas.View).'
  if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente para ver la agenda.'
  if (status === 0) return 'No se pudo conectar con el servidor para cargar las citas.'
  return readErrorMessage(err) ?? 'No se pudieron cargar las citas.'
}

export function describeAgendaCatalogFailure(
  key: AgendaCatalogKey,
  err: unknown,
): AgendaCatalogFailure {
  const info = AGENDA_CATALOGS[key]
  const status = readErrorStatus(err)
  let message: string
  if (status === 403) message = `sin permiso ${info.permission} (403)`
  else if (status === 401) message = 'sesión no autorizada (401)'
  else if (status === 0) message = 'sin conexión con el servidor'
  else if (status >= 500) message = `error del servidor (${status})`
  else if (status > 0) message = `error ${status}`
  else message = 'error inesperado'
  return { key, ...info, status, message }
}

export function formatAgendaCatalogFailure(failure: AgendaCatalogFailure): string {
  return `${failure.label} (${failure.endpoint}): ${failure.message}`
}

function valueOrEmpty<T>(result: PromiseSettledResult<T[]>): T[] {
  return result.status === 'fulfilled' && Array.isArray(result.value) ? result.value : []
}

/** Arma la Agenda con las citas y lo que haya llegado de cada catálogo. */
export function buildAgendaFromSettled(
  appointments: ApiAppointmentResponse[],
  catalogs: AgendaCatalogResults,
): AgendaLoadBundle {
  const veterinarians = valueOrEmpty(catalogs.veterinarians)
  const pets = valueOrEmpty(catalogs.pets)
  const clientsPets = valueOrEmpty(catalogs.clientsPets)
  const clients = valueOrEmpty(catalogs.clients)
  const species = valueOrEmpty(catalogs.species)
  const races = valueOrEmpty(catalogs.races)
  const services = valueOrEmpty(catalogs.services)
  const statuses = valueOrEmpty(catalogs.statuses)

  const clientsById = new Map(clients.map((c) => [c.id, c]))
  const petsById = new Map(pets.map((p) => [p.id, p]))
  const clientPetsById = new Map(clientsPets.map((cp) => [cp.id, cp]))
  const speciesById = new Map(species.map((s) => [s.id, s.name]))
  const racesById = new Map(races.map((r) => [r.id, r.name]))
  const vetsById = new Map(veterinarians.map((v) => [v.id, v]))
  const servicesById = new Map(services.map((s) => [s.id, s.name]))
  const statusesById = new Map(statuses.map((s) => [s.id.toLowerCase(), s.name]))

  const citas = appointments.map((apt) => {
    const clientPet = clientPetsById.get(apt.clientPetId)
    const pet = clientPet ? petsById.get(clientPet.petId) : undefined
    const client = clientPet ? clientsById.get(clientPet.clientId) : undefined
    const vet = vetsById.get(apt.veterinarianId)
    const statusName =
      apt.statusName || (apt.statusId ? statusesById.get(apt.statusId.toLowerCase()) : undefined)

    const cita = mapAppointmentToCita(apt, {
      petName: pet?.name || apt.petName || AGENDA_FALLBACKS.petName,
      petBreed: (pet && racesById.get(pet.raceId)) || AGENDA_FALLBACKS.petBreed,
      species: (pet && speciesById.get(pet.speciesId)) || AGENDA_FALLBACKS.species,
      ownerName: client?.fullName || AGENDA_FALLBACKS.ownerName,
      professionalName:
        vet?.userFullName || apt.veterinarianName || AGENDA_FALLBACKS.professionalName,
      statusName,
    })
    return {
      ...cita,
      service: cita.service || servicesById.get(apt.serviceId) || AGENDA_FALLBACKS.service,
    }
  })

  let profesionalesOpciones: { id: string; name: string }[]
  if (veterinarians.length > 0) {
    profesionalesOpciones = veterinarians.map((v) => ({
      id: v.id,
      name: v.userFullName ?? 'Profesional',
    }))
  } else {
    // Sin catálogo de veterinarios: el filtro se arma con los profesionales de las citas.
    const fromCitas = new Map<string, string>()
    for (const apt of appointments) {
      if (!fromCitas.has(apt.veterinarianId)) {
        fromCitas.set(
          apt.veterinarianId,
          apt.veterinarianName || AGENDA_FALLBACKS.professionalName,
        )
      }
    }
    profesionalesOpciones = [...fromCitas.entries()].map(([id, name]) => ({ id, name }))
  }

  const mascotasOpciones: AgendaPetOption[] = clientsPets.map((cp) => {
    const pet = petsById.get(cp.petId)
    const client = clientsById.get(cp.clientId)
    return {
      clientPetId: cp.id,
      petId: cp.petId,
      petName: pet?.name ?? 'Mascota',
      breed: pet ? racesById.get(pet.raceId) ?? '' : '',
      species: pet ? speciesById.get(pet.speciesId) ?? '' : '',
      ownerName: client?.fullName ?? 'Dueño',
      clientId: cp.clientId,
      ownerPhone: client?.phoneNumber ?? undefined,
    }
  })

  const catalogFailures: AgendaCatalogFailure[] = []
  for (const key of AGENDA_CATALOG_KEYS) {
    const result = catalogs[key]
    if (result.status === 'rejected') {
      catalogFailures.push(describeAgendaCatalogFailure(key, result.reason))
    }
  }

  return {
    citas,
    profesionalesOpciones,
    serviciosOpciones: services.map((s) => ({ id: s.id, name: s.name })),
    mascotasOpciones,
    statusCatalog: statuses.map((s) => ({ id: s.id, name: s.name })),
    catalogFailures,
  }
}

function invoke<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return fn()
  } catch (err) {
    return Promise.reject(err)
  }
}

/** Carga en paralelo; solo el rechazo de citas bloquea la Agenda. */
export async function loadAgendaData(fetchers: AgendaFetchers): Promise<AgendaLoadResult> {
  const [
    appointments,
    veterinarians,
    pets,
    clientsPets,
    clients,
    species,
    races,
    services,
    statuses,
  ] = await Promise.allSettled([
    invoke(fetchers.appointments),
    invoke(fetchers.veterinarians),
    invoke(fetchers.pets),
    invoke(fetchers.clientsPets),
    invoke(fetchers.clients),
    invoke(fetchers.species),
    invoke(fetchers.races),
    invoke(fetchers.services),
    invoke(fetchers.statuses),
  ])

  if (appointments.status === 'rejected') {
    return {
      ok: false,
      status: readErrorStatus(appointments.reason),
      error: resolveAgendaAppointmentsError(appointments.reason),
    }
  }

  return {
    ok: true,
    data: buildAgendaFromSettled(appointments.value ?? [], {
      veterinarians,
      pets,
      clientsPets,
      clients,
      species,
      races,
      services,
      statuses,
    }),
  }
}
