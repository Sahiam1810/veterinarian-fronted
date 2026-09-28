// Tipos de historia clínica (contrato futuro con la API)

export interface HistoriaConsulta {
  id: string
  dateLabel: string
  typeLabel: string
  veterinarian?: string
  motivo: string
  diagnostico?: string
  tratamientoIndicaciones: string[]
  ordenesMedicas: HistoriaOrden[]
}

export interface HistoriaOrdenItem {
  id: string
  name: string
  notes?: string | null
  unitPrice?: number | null
}

export interface HistoriaOrden {
  id: string
  type: 'MEDICAMENTO' | 'PROCEDIMIENTO'
  dateLabel: string
  veterinarian?: string | null
  status: string
  items: HistoriaOrdenItem[]
  resultFileUrl?: string | null
}

export interface HistoriaVacuna {
  id: string
  name: string
  appliedLabel: string
  nextLabel: string
}

// S44: solo Temperatura — el modelo (MedicalRecord) nunca tuvo F.C./F.R./Mucosas,
// esos campos siempre mostraban "Sin dato" fijo.
export interface HistoriaSignosVitales {
  temperatura: string
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
