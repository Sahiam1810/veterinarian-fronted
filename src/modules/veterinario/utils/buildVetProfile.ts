import type { ApiCurrentProfile, ApiVeterinarian } from '../api/apiTypes'
import type { VetProfilePayload } from '../types'

function mapAccountStatus(raw: string | null | undefined): 'activa' | 'inactiva' {
  const value = (raw || '').trim().toLowerCase()
  if (!value) return 'activa'
  if (
    value.includes('inactiv') ||
    value === 'disabled' ||
    value === 'blocked' ||
    value === 'suspended'
  ) {
    return 'inactiva'
  }
  return 'activa'
}

function withTitlePrefix(fullName: string, role: string): string {
  const name = fullName.trim()
  if (!name) return 'Veterinario'
  const lower = name.toLowerCase()
  if (lower.startsWith('dr.') || lower.startsWith('dra.')) return name
  const roleLower = role.toLowerCase()
  if (roleLower.includes('vet')) return `Dr(a). ${name}`
  return name
}

// Arma el payload de UI a partir del perfil autenticado y el registro de veterinario.
export function buildVetProfilePayload(input: {
  profile: ApiCurrentProfile
  veterinarian?: ApiVeterinarian
  specialtyDescription?: string | null
}): VetProfilePayload {
  const { profile, veterinarian, specialtyDescription } = input
  const fullName = profile.fullName?.trim() || profile.userName?.trim() || 'Sin nombre'
  const specialty = veterinarian?.specialtyName?.trim() || 'Sin especialidad asignada'
  const description = specialtyDescription?.trim()

  return {
    displayName: withTitlePrefix(fullName, profile.role || ''),
    initials: (profile.initials || fullName.slice(0, 2) || 'VT').toUpperCase(),
    jobTitle: profile.role?.trim() || 'Veterinario',
    accountStatus: mapAccountStatus(profile.accountStatus),
    fullName,
    systemRole: profile.role?.trim() || 'Veterinario',
    email: profile.email?.trim() || 'Sin correo',
    userName: profile.userName?.trim() || '—',
    phone: 'No disponible en el sistema',
    mainSpecialty: specialty,
    subSpecialty: description || 'No registrada',
    licenseNumber: veterinarian?.licenseNumber?.trim() || 'Sin colegiatura',
  }
}
