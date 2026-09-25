import { vetApiFetch } from '../api/vetHttp.ts'

// Modelos del catálogo
export interface ApiMedication {
  id: string
  name: string
  code?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface ApiProcedure {
  id: string
  name: string
  code?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

// Detalle y Cabecera de Órdenes
export interface ApiMedicationOrderItem {
  id: string
  medicationOrderId: string
  medicationId: string
  medicationName?: string | null
  notes?: string | null
}

export interface ApiMedicationOrder {
  id: string
  clientPetId: string
  veterinarianId: string
  appointmentId?: string | null
  hospitalizationStayId?: string | null
  isInHouse: boolean
  referredTo?: string | null
  referralReason?: string | null
  status: 'Pendiente' | 'Entregada' | string
  createdAt: string
  updatedAt?: string | null
  items: ApiMedicationOrderItem[]
}

export interface ApiProcedureOrderItem {
  id: string
  procedureOrderId: string
  procedureId: string
  procedureName?: string | null
  notes?: string | null
}

export interface ApiProcedureOrder {
  id: string
  clientPetId: string
  veterinarianId: string
  appointmentId?: string | null
  hospitalizationStayId?: string | null
  isInHouse: boolean
  referredTo?: string | null
  referralReason?: string | null
  status: 'Pendiente' | 'Completada' | string
  resultFileUrl?: string | null
  createdAt: string
  updatedAt?: string | null
  items: ApiProcedureOrderItem[]
}

// DTOs de Creación / Edición
export interface CreateMedicationDto {
  name: string
  code?: string | null
  isActive?: boolean
}

export interface UpdateMedicationDto {
  name: string
  code?: string | null
  isActive: boolean
}

export interface CreateProcedureDto {
  name: string
  code?: string | null
  isActive?: boolean
}

export interface UpdateProcedureDto {
  name: string
  code?: string | null
  isActive: boolean
}

export interface CreateMedicationOrderItemInput {
  medicationId: string
  notes?: string | null
}

export interface CreateMedicationOrderInput {
  clientPetId: string
  appointmentId?: string | null
  hospitalizationStayId?: string | null
  isInHouse: boolean
  referredTo?: string | null
  referralReason?: string | null
  items?: CreateMedicationOrderItemInput[] | null
}

export interface CreateProcedureOrderItemInput {
  procedureId: string
  notes?: string | null
}

export interface CreateProcedureOrderInput {
  clientPetId: string
  appointmentId?: string | null
  hospitalizationStayId?: string | null
  isInHouse: boolean
  referredTo?: string | null
  referralReason?: string | null
  items?: CreateProcedureOrderItemInput[] | null
}

// Services - Catálogo de Medicamentos
export async function fetchMedications(onlyActive = true): Promise<ApiMedication[]> {
  const query = onlyActive ? '?onlyActive=true' : '?onlyActive=false'
  return vetApiFetch<ApiMedication[]>(`/api/medications${query}`).catch(() => [])
}

export async function createMedication(data: CreateMedicationDto): Promise<ApiMedication> {
  return vetApiFetch<ApiMedication>('/api/medications', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateMedication(id: string, data: UpdateMedicationDto): Promise<void> {
  await vetApiFetch(`/api/medications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteMedication(id: string): Promise<void> {
  await vetApiFetch(`/api/medications/${id}`, {
    method: 'DELETE',
  })
}

// Services - Catálogo de Procedimientos
export async function fetchProcedures(onlyActive = true): Promise<ApiProcedure[]> {
  const query = onlyActive ? '?onlyActive=true' : '?onlyActive=false'
  return vetApiFetch<ApiProcedure[]>(`/api/procedures${query}`).catch(() => [])
}

export async function createProcedure(data: CreateProcedureDto): Promise<ApiProcedure> {
  return vetApiFetch<ApiProcedure>('/api/procedures', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProcedure(id: string, data: UpdateProcedureDto): Promise<void> {
  await vetApiFetch(`/api/procedures/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteProcedure(id: string): Promise<void> {
  await vetApiFetch(`/api/procedures/${id}`, {
    method: 'DELETE',
  })
}

// Services - Órdenes de Medicamentos
export async function createMedicationOrder(data: CreateMedicationOrderInput): Promise<ApiMedicationOrder> {
  return vetApiFetch<ApiMedicationOrder>('/api/medication-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function completeMedicationOrder(id: string): Promise<void> {
  await vetApiFetch(`/api/medication-orders/${id}/complete`, {
    method: 'PATCH',
  })
}

export async function fetchMedicationOrdersByAppointment(appointmentId: string): Promise<ApiMedicationOrder[]> {
  return vetApiFetch<ApiMedicationOrder[]>(`/api/medication-orders/appointment/${appointmentId}`).catch(() => [])
}

export async function fetchMedicationOrdersByStay(stayId: string): Promise<ApiMedicationOrder[]> {
  return vetApiFetch<ApiMedicationOrder[]>(`/api/medication-orders/hospitalization/${stayId}`)
}

// Services - Órdenes de Procedimientos
export async function createProcedureOrder(data: CreateProcedureOrderInput): Promise<ApiProcedureOrder> {
  return vetApiFetch<ApiProcedureOrder>('/api/procedure-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function completeProcedureOrder(id: string, resultFileUrl?: string | null): Promise<void> {
  await vetApiFetch(`/api/procedure-orders/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ resultFileUrl: resultFileUrl || null }),
  })
}

export async function fetchProcedureOrdersByAppointment(appointmentId: string): Promise<ApiProcedureOrder[]> {
  return vetApiFetch<ApiProcedureOrder[]>(`/api/procedure-orders/appointment/${appointmentId}`).catch(() => [])
}

export async function fetchProcedureOrdersByStay(stayId: string): Promise<ApiProcedureOrder[]> {
  return vetApiFetch<ApiProcedureOrder[]>(`/api/procedure-orders/hospitalization/${stayId}`)
}


export interface PendingMedicationOrder {
  id: string
  petName: string
  ownerName: string
  appointmentId: string
  isInHouse: boolean
  status: string
  createdAt: string
  items: ApiMedicationOrderItem[]
}

export interface PendingProcedureOrder {
  id: string
  petName: string
  ownerName: string
  appointmentId: string
  isInHouse: boolean
  status: string
  resultFileUrl?: string | null
  createdAt: string
  items: ApiProcedureOrderItem[]
}

export async function fetchPendingMedicationOrders(): Promise<PendingMedicationOrder[]> {
  return vetApiFetch<PendingMedicationOrder[]>('/api/medication-orders/pending')
}

export async function fetchPendingProcedureOrders(): Promise<PendingProcedureOrder[]> {
  return vetApiFetch<PendingProcedureOrder[]>('/api/procedure-orders/pending')
}
