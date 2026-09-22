// Perfil del recepcionista (datos reales de /api/auth/me)

export interface RecepProfilePayload {
  id: string
  displayName: string
  fullName: string
  email: string
  role: string
  jobTitle: string
  accountStatus: string
  initials: string
  photoUrl?: string | null
  passwordUpdatedLabel?: string
}

export interface ChangeRecepPasswordPayload {
  currentPassword: string
  newPassword: string
}
