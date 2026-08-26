import type { VetProfilePayload } from '../types'

// Perfil de ejemplo (mientras no exista el endpoint)
const MOCK_PROFILE: VetProfilePayload = {
  displayName: 'Dr. Roberto Méndez',
  jobTitle: 'Veterinario Titular',
  accountStatus: 'activa',
  photoUrl: null,
  fullName: 'Dr. Roberto Andrés Méndez Silva',
  systemRole: 'Veterinario',
  email: 'r.mendez@vetclinica.com',
  phone: '+56 9 8765 4321',
  mainSpecialty: 'Medicina Interna',
  subSpecialty: 'Cirugía General',
  licenseNumber: '12455-A',
}

// Obtiene el perfil del veterinario; sustituir por fetch al API .NET
export async function fetchVetProfile(): Promise<VetProfilePayload> {
  // Ejemplo futuro:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vet/profile`)
  // if (!res.ok) throw new Error('No se pudo cargar el perfil')
  // return res.json()
  return Promise.resolve(MOCK_PROFILE)
}
