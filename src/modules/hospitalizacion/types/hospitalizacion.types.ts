export type HospitalizationStayStatus = 'Activa' | 'Dada de alta'

export interface ApiHospitalizationStay {
  id: string
  clientPetId: string
  petName: string | null
  ownerName: string | null
  appointmentId: string | null
  admittedAt: string
  dischargedAt: string | null
  status: HospitalizationStayStatus
  motivo: string
  admittedByUserId: string
  admittedByName: string | null
  baseCost?: number | null
}

export interface ApiHospitalizationNote {
  id: string
  stayId: string
  authorUserId: string
  authorName: string | null
  createdAt: string
  nota: string
  handedToUserId: string | null
  handedToName: string | null
}

export interface ApiStaffMember {
  id: string
  name: string
  roleName: string
}

export interface AdmitStayDto {
  clientPetId: string
  appointmentId?: string | null
  motivo: string
}

export interface AddStayNoteDto {
  nota: string
  entregadoAUserId?: string | null
}

export interface ApiHospitalizationSupplyConsumption {
  id: string
  stayId: string
  supplyId: string
  supplyName?: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  notes?: string | null
  createdAt: string
  registeredByName?: string | null
}

export interface AddStaySupplyConsumptionDto {
  supplyId: string
  quantity: number
  notes?: string | null
}

export interface HospitalizationLiquidationSummary {
  hospitalizationTotal: number
  insumosTotal: number
  medicamentosTotal: number
  procedimientosTotal: number
  total: number
}
