// Tipos del perfil del veterinario (datos reales de /api/auth/me + veterinarians).

export interface VetProfilePayload {
  displayName: string
  // Iniciales del API; se muestran en avatar (si no hay foto local).
  initials: string
  photoUrl?: string | null
  jobTitle: string
  accountStatus: 'activa' | 'inactiva'
  fullName: string
  systemRole: string
  email: string
  userName: string
  // El dominio actual no guarda teléfono del staff en la entidad de usuario.
  phone: string
  mainSpecialty: string
  // No hay sub-especialidad en el modelo; usamos descripción si existe.
  subSpecialty: string
  licenseNumber: string
}

export interface ChangeVetPasswordPayload {
  currentPassword: string
  newPassword: string
}
