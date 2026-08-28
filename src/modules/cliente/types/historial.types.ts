export interface ClienteHistorialPetOption {
  id: string
  name: string
  speciesBreed: string
  photoUrl: string | null
}

export interface ClienteHistorialConsultation {
  id: string
  dateLabel: string
  serviceName: string
  professionalName: string
  symptoms: string
  diagnosis: string
  treatment?: string
}

export type ClienteVaccineStatus = 'proxima' | 'vencida' | 'al_dia'

export interface ClienteHistorialVaccine {
  id: string
  name: string
  doseLabel: string
  appliedDateLabel: string
  status: ClienteVaccineStatus
  statusLabel: string
}

export interface ClienteHistorialPetRecord {
  pet: ClienteHistorialPetOption
  consultations: ClienteHistorialConsultation[]
  vaccines: ClienteHistorialVaccine[]
}

export interface ClienteHistorialPayload {
  pets: ClienteHistorialPetRecord[]
}
