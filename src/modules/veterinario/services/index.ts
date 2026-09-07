export { fetchVetHomeDashboard, fetchVetHomeBundle } from './vetHomeService'
export { fetchVetNavPermissions } from './vetNavPermissionsService'
export {
  fetchVetAgendaWeek,
  fetchStatusAppointments,
  updateAppointmentStatus,
  findStatusId,
} from './vetAgendaService'
export type {
  ApiStatusAppointment,
  ApiUpdateAppointmentStatusRequest,
  FetchVetAgendaParams,
} from './vetAgendaService'
export { fetchVetMascotasDirectory, fetchVetMascotasBundle } from './vetMascotasService'
export {
  fetchHistoriaClinica,
  fetchDiagnostics,
  createMedicalRecord,
} from './historiaClinicaService'
export type {
  ApiDiagnostic,
  ApiCreateMedicalRecordRequest,
  ApiCreateMedicalRecordResponse,
} from './historiaClinicaService'
export { fetchVetProfile, changeVetPassword } from './vetProfileService'

