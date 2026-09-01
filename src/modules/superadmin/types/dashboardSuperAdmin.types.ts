export type AppointmentStatus = 'Agendado' | 'En sala' | 'Atendido' | 'Cancelado'

export type PetType = 'Perro' | 'Gato' | 'Ave' | 'Otro'

export interface Appointment {
  id: string
  time: string
  petName: string
  petType: PetType | string
  service: string
  professional: string
  status: AppointmentStatus
}

export interface DashboardStats {
  totalAppointments: number
  attendedAppointments: number
  attendedPercentage: number
  cancelledAppointments: number
  activeProfessionals: number
  formattedDate?: string
}

export type QuickActionVariant = 'terracotta' | 'brand' | 'sage' | 'primary-cta'

export interface QuickActionItem {
  id: string
  title: string
  subtitle?: string
  variant: QuickActionVariant
  actionType: 'create-user' | 'register-owner' | 'register-pet' | 'schedule-appointment'
}
