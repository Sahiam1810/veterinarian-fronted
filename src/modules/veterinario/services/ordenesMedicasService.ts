import { vetApiFetch } from '../api/vetHttp'

// Modelos del catálogo
public interface ApiMedication {
  id: string
  name: string
  code?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

public interface ApiProcedure {
  id: string
  name: string
  code?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

// Detalle y Cabecera de Órdenes
public interface ApiMedicationOrderItem {
  id: string
  medicationOrderId: string
  medicationId: string
  medicationName?: string | null
  notes?: string | null
}

public interface ApiMedicationOrder {
  id: string
  clientPetId: string
  veterinarianId: string
  appointmentId: string
  isInHouse: boolean
  referredTo?: string | null
  referralReason?: string | null
  status: 'Pendiente' | 'Entregada' | string
  createdAt: string
  updatedAt?: string | null
  items: ApiMedicationOrderItem[]
}

public interface ApiProcedureOrderItem {
  id: string
  procedureOrderId: string
  procedureId: string
  procedureName?: string | null
  notes?: string | null
}

public interface ApiProcedureOrder {
  id: string
  clientPetId: string
  veterinarianId: string
  appointmentId: string
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
public interface CreateMedicationDto {
  name: string
  code?: string | null
  isActive?: boolean
}

public interface UpdateMedicationDto {
  name: string
  code?: string | null
  isActive: boolean
}

public interface CreateProcedureDto {
  name: string
  code?: string | null
  isActive?: boolean
}

public interface UpdateProcedureDto {
  name: string
  code?: string | null
  isActive: boolean
}

public interface CreateMedicationOrderItemInput {
  medicationId: string
  notes?: string | null
}

public interface CreateMedicationOrderInput {
  clientPetId: string
  veterinarianId: string
  appointmentId: string
  isInHouse: boolean
  referredTo?: string | null
  referralReason?: string | null
  items?: CreateMedicationOrderItemInput[] | null
}

public interface CreateProcedureOrderItemInput {
  procedureId: string
  notes?: string | null
}

public interface CreateProcedureOrderInput {
  clientPetId: string
  veterinarianId: string
  appointmentId: string
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
