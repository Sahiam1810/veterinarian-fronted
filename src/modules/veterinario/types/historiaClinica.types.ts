// Tipos de historia clínica (contrato futuro con la API)

export interface HistoriaConsulta {
  id: string
  dateLabel: string
  typeLabel: string
  veterinarian?: string
  motivo: string
  diagnostico?: string
  tratamientoIndicaciones: string[]
}

export interface HistoriaVacuna {
  id: string
  name: string
  appliedLabel: string
  nextLabel: string
}

export interface HistoriaSignosVitales {
  temperatura: string
  frecuenciaCardiaca: string
  frecuenciaRespiratoria: string
  mucosas: string
}

export interface HistoriaClinicaPayload {
  petId: string
  displayName: string
  patientCode: string
  sexLabel: string
  breed: string
  ageLabel: string
  weightLabel: string
  ownerName: string
  ownerPhone: string
  photoUrl?: string | null
  consultas: HistoriaConsulta[]
  vacunas: HistoriaVacuna[]
  signosVitales: HistoriaSignosVitales
}
