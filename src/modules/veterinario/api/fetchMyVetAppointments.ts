import { vetApiFetch } from './vetHttp'
import type { ApiAppointment } from './apiTypes'

interface ApiPaginatedAppointments {
  items?: ApiAppointment[] | null
  pagination?: {
    page?: number
    pageSize?: number
    totalItems?: number
    totalPages?: number
  } | null
}

// Citas del veterinario autenticado (Citas.View). No usa GET /api/appointments
// porque esa ruta pide Plataforma.View y responde 403 al rol Veterinario.
export async function fetchMyVetAppointments(): Promise<ApiAppointment[]> {
  const pageSize = 100
  const all: ApiAppointment[] = []
  let page = 1
  let totalPages = 1

  do {
    const response = await vetApiFetch<ApiPaginatedAppointments>(
      `/api/appointments/me?page=${page}&pageSize=${pageSize}`,
    )
    all.push(...(response.items ?? []))
    totalPages = response.pagination?.totalPages || 1
    page += 1
  } while (page <= totalPages && page <= 20)

  return all
}
