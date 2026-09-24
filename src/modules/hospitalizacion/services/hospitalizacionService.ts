import { apiClient } from '../../../services/apiClient.ts'
import type {
  ApiHospitalizationStay,
  ApiHospitalizationNote,
  ApiStaffMember,
  AdmitStayDto,
  AddStayNoteDto,
  ApiHospitalizationSupplyConsumption,
  AddStaySupplyConsumptionDto,
  HospitalizationLiquidationSummary,
  PetAdmissionOption,
} from '../types/hospitalizacion.types.ts'

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
  return apiClient.get<PetAdmissionOption[]>('/api/hospitalization-stays/admission-options')
}
