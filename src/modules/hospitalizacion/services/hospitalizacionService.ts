import { apiClient } from '@/services'
import type {
  ApiHospitalizationStay,
  ApiHospitalizationNote,
  ApiStaffMember,
  AdmitStayDto,
  AddStayNoteDto,
  ApiHospitalizationSupplyConsumption,
  AddStaySupplyConsumptionDto,
  HospitalizationLiquidationSummary,
} from '../types/hospitalizacion.types'

export interface PetAdmissionOption {
  clientPetId: string
  petName: string
  ownerName: string
  petId: string
  clientId: string
}

export async function fetchActiveStays(): Promise<ApiHospitalizationStay[]> {
  return apiClient.get<ApiHospitalizationStay[]>('/api/hospitalization-stays/active')
}

export async function fetchStayById(id: string): Promise<ApiHospitalizationStay> {
  return apiClient.get<ApiHospitalizationStay>(`/api/hospitalization-stays/${id}`)
}

export async function fetchStaysByPet(clientPetId: string): Promise<ApiHospitalizationStay[]> {
  return apiClient.get<ApiHospitalizationStay[]>(`/api/hospitalization-stays/pet/${clientPetId}`)
}

export async function admitStay(data: AdmitStayDto): Promise<{ id: string } | string> {
  return apiClient.post<{ id: string } | string>('/api/hospitalization-stays', {
    clientPetId: data.clientPetId,
    appointmentId: data.appointmentId ?? null,
    motivo: data.motivo,
  })
}

export async function dischargeStay(id: string): Promise<void> {
  return apiClient.patch<void>(`/api/hospitalization-stays/${id}/discharge`)
}

export async function fetchStayNotes(id: string): Promise<ApiHospitalizationNote[]> {
  return apiClient.get<ApiHospitalizationNote[]>(`/api/hospitalization-stays/${id}/notes`)
}

export async function addStayNote(id: string, data: AddStayNoteDto): Promise<{ id: string } | string> {
  return apiClient.post<{ id: string } | string>(`/api/hospitalization-stays/${id}/notes`, data)
}

export async function fetchStaff(): Promise<ApiStaffMember[]> {
  return apiClient.get<ApiStaffMember[]>('/api/hospitalization-stays/staff')
}

export async function fetchStaySupplyConsumptions(stayId: string): Promise<ApiHospitalizationSupplyConsumption[]> {
  return apiClient
    .get<ApiHospitalizationSupplyConsumption[]>(`/api/hospitalization-stays/${stayId}/supplies`)
    .catch(() =>
      apiClient
        .get<ApiHospitalizationSupplyConsumption[]>(`/api/hospitalization-stays/${stayId}/consumptions`)
        .catch(() => []),
    )
}

export async function addStaySupplyConsumption(
  stayId: string,
  data: AddStaySupplyConsumptionDto,
): Promise<ApiHospitalizationSupplyConsumption | { id: string }> {
  return apiClient.post<ApiHospitalizationSupplyConsumption | { id: string }>(
    `/api/hospitalization-stays/${stayId}/supplies`,
    data,
  )
}

export async function fetchStayLiquidation(stayId: string): Promise<HospitalizationLiquidationSummary | null> {
  return apiClient
    .get<HospitalizationLiquidationSummary>(`/api/hospitalization-stays/${stayId}/liquidation`)
    .catch(() => null)
}

export async function fetchPetAdmissionOptions(): Promise<PetAdmissionOption[]> {
  const [clientsPets, pets, clients] = await Promise.all([
    apiClient.get<{ id: string; clientId: string; petId: string }[]>('/api/ClientsPets').catch(() =>
      apiClient.get<{ id: string; clientId: string; petId: string }[]>('/api/clientspets').catch(() => []),
    ),
    apiClient.get<{ id: string; name: string }[]>('/api/Pets').catch(() =>
      apiClient.get<{ id: string; name: string }[]>('/api/pets').catch(() => []),
    ),
    apiClient.get<{ id: string; fullName?: string; name?: string }[]>('/api/Clients').catch(() =>
      apiClient.get<{ id: string; fullName?: string; name?: string }[]>('/api/clients').catch(() => []),
    ),
  ])

  const petsById = new Map((pets || []).map((p) => [p.id.toLowerCase(), p.name]))
  const clientsById = new Map(
    (clients || []).map((c) => [c.id.toLowerCase(), c.fullName || c.name || 'Propietario']),
  )

  return (clientsPets || []).map((cp) => {
    const petName = petsById.get(cp.petId.toLowerCase()) || 'Mascota'
    const ownerName = clientsById.get(cp.clientId.toLowerCase()) || 'Propietario'
    return {
      clientPetId: cp.id,
      petName,
      ownerName,
      petId: cp.petId,
      clientId: cp.clientId,
    }
  })
}
