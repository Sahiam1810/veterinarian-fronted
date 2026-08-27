import type { RecepProfilePayload } from '../types'

const MOCK_PROFILE: RecepProfilePayload = {
  displayName: 'Laura Martínez',
  jobTitle: 'Recepcionista',
  accountStatus: 'activa',
  photoUrl: null,
  fullName: 'Laura Martínez Silva',
  email: 'laura.m@terravet.com',
  phone: '+34 600 123 456',
  employeeId: 'TV-REC-042',
  hireDateLabel: '15 de Marzo, 2022',
  passwordUpdatedLabel: 'Última actualización hace 3 meses',
}

export async function fetchRecepProfile(): Promise<RecepProfilePayload> {
  return Promise.resolve(MOCK_PROFILE)
}
