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

export interface HospitalizationInvoiceItem {
  name: string
  quantity: number
  unitPrice: number
  total: number
  notes?: string | null
}

export interface HospitalizationInvoice {
  stayId: string
  petName: string | null
  ownerName: string | null
  admittedAt: string
  dischargedAt: string | null
  status: string
  dailyRate?: number
  billedDays?: number
  isPaid?: boolean
  paidAt?: string | null
  hospitalizationTotal: number
  suppliesTotal: number
  medicationsTotal: number
  proceduresTotal: number
  total: number
  supplies: HospitalizationInvoiceItem[]
  medications: HospitalizationInvoiceItem[]
  procedures: HospitalizationInvoiceItem[]
}

