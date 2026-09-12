export {
  fetchVetHomeDashboard,
  fetchVetHomeBundle,
  markVetNotificationAsRead,
  mapVetNotification,
} from './vetHomeService'
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
export {
  fetchVetMascotasDirectory,
  fetchVetMascotasBundle,
  createVetPet,
  updateVetPet,
  deleteVetPet,
  deleteVetClientPet,
} from './vetMascotasService'
export type {
  VetMascotasBundle,
  CreateVetPetPayload,
  UpdateVetPetPayload,
} from './vetMascotasService'
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

