// Tipos del perfil del veterinario (contrato futuro con la API)

export interface VetProfilePayload {
  displayName: string
  jobTitle: string
  accountStatus: 'activa' | 'inactiva'
  photoUrl?: string | null
  fullName: string
  systemRole: string
  email: string
  phone: string
  mainSpecialty: string
  subSpecialty: string
  licenseNumber: string
}
