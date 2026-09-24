import { apiClient } from '@/services'
import type {
  ApiHospitalizationStay,
  ApiHospitalizationNote,
  ApiStaffMember,
  AdmitStayDto,
  AddStayNoteDto,
} from '../types/hospitalizacion.types'

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
  return apiClient.post<{ id: string } | string>('/api/hospitalization-stays', data)
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
