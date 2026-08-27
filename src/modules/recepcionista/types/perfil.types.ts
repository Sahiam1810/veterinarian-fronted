// Perfil del recepcionista (contrato futuro con API)

export interface RecepProfilePayload {
  displayName: string
  jobTitle: string
  accountStatus: 'activa' | 'inactiva'
  photoUrl?: string | null
  fullName: string
  email: string
  phone: string
  employeeId: string
  hireDateLabel: string
  passwordUpdatedLabel: string
}
