export type {
  ClienteAppointmentStatus,
  ClienteHomeProfile,
  ClienteHomeStats,
  ClienteNextAppointment,
  ClienteUpcomingAppointment,
  ClienteQuickActionId,
  ClienteHomeDashboard,
} from './home.types'

export type {
  ClienteMascotaEstado,
  ClienteMascotaHistoryRow,
  ClienteMascotaUpcomingAppointment,
  ClienteMascotaDetail,
  ClienteMascotasPayload,
} from './mascotas.types'

export type {
  ClienteCitaTab,
  ClienteCitaListItem,
  ClienteCitasPayload,
} from './citas.types'

export type { ClienteAccountStatus, ClienteProfilePayload } from './perfil.types'

export type {
  ClienteHistorialPetOption,
  ClienteHistorialConsultation,
  ClienteVaccineStatus,
  ClienteHistorialVaccine,
  ClienteHistorialPetRecord,
  ClienteHistorialPayload,
} from './historial.types'

export type {
  DbUser,
  DbClient,
  DbPet,
  DbClientPet,
  DbAppointment,
  DbMedicalRecord,
  DbVaccination,
  DbAccountStatement,
  DbClientPortalProfile,
} from './db.types'
