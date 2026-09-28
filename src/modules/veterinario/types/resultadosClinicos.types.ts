export type ClinicalResultStatus =
  | 'COMPLETED_WITH_RESULT'
  | 'COMPLETED_WITHOUT_RESULT'
  | 'PENDING'
  | string

export interface ClinicalResultItem {
  id: string
  procedureId: string
  procedureName?: string | null
  notes?: string | null
  unitPrice?: number | null
}

export interface ClinicalResult {
  procedureOrderId: string
  clientPetId: string
  appointmentId?: string | null
  hospitalizationStayId?: string | null
  petName: string
  species?: string | null
  breed?: string | null
  ownerName: string
  ownerPhone?: string | null
  procedureName?: string | null
  notes?: string | null
  status: ClinicalResultStatus
  requestedAt: string
  completedAt?: string | null
  veterinarianId: string
  veterinarianName?: string | null
  unitPrice?: number | null
  resultFileUrl?: string | null
  items: ClinicalResultItem[]
}

export interface ClinicalResultsPagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ClinicalResultsResponse {
  items: ClinicalResult[]
  pagination: ClinicalResultsPagination
}

export interface ClinicalResultsFilters {
  search: string
  veterinarianId: string
  from: string
  to: string
  status: string
}
