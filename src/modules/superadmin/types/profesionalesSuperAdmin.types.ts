export type EstadoProfesional = 'Activo' | 'Inactivo'

export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIÉRCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SÁBADO'
  | 'DOMINGO'

export interface BloqueHorario {
  id: string
  dia: DiaSemana
  horaInicio: string // e.g. "08:00"
  horaFin: string    // e.g. "12:00"
  tipoAtencion: string // e.g. "Cirugía Programada", "Consulta General", "Emergencias"
}

export interface ProfesionalSuperAdmin {
  id: string
  name: string
  cmp: string
  especialidad: string
  email: string
  phone?: string
  status: EstadoProfesional
  avatarUrl?: string
  horario: BloqueHorario[]
  // IDs internos para sincronizar con la API
  userId?: string
  roleId?: string
  specialtyId?: string
}

export interface ProfesionalHorarioConfig {
  enabled: boolean
  dias: DiaSemana[]
  horaInicio: string // e.g. "07:00"
  horaFin: string    // e.g. "17:00"
}

export interface ProfesionalFormData {
  name: string
  cmp: string
  especialidad: string
  email: string
  phone?: string
  status: EstadoProfesional
  avatarUrl?: string
  horarioConfig?: ProfesionalHorarioConfig
}

export interface BloqueHorarioFormData {
  dia: DiaSemana
  horaInicio: string
  horaFin: string
  tipoAtencion: string
}
