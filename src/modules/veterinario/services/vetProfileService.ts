import { vetApiFetch } from '../api/vetHttp'
import type { ApiCurrentProfile, ApiVeterinarian } from '../api/apiTypes'
import type { VetProfilePayload } from '../types'
import { findVeterinarianForProfile } from '../utils/buildVetHomeDashboard'
import { buildVetProfilePayload } from '../utils/buildVetProfile'

interface ApiSpecialty {
  id: string
  name: string
  description?: string | null
}

// Carga el perfil real del veterinario autenticado (solo lectura).
export async function fetchVetProfile(): Promise<VetProfilePayload> {
  const profile = await vetApiFetch<ApiCurrentProfile>('/api/auth/me')
  const [veterinarians, specialties] = await Promise.all([
    vetApiFetch<ApiVeterinarian[]>('/api/veterinarians'),
    vetApiFetch<ApiSpecialty[]>('/api/specialties').catch(() => [] as ApiSpecialty[]),
  ])

  const veterinarian = findVeterinarianForProfile(veterinarians, profile)
  const specialty = specialties.find(
    (item) => item.id.toLowerCase() === veterinarian?.specialtyId?.toLowerCase(),
  )

  return buildVetProfilePayload({
    profile,
    veterinarian,
    specialtyDescription: specialty?.description,
  })
}
