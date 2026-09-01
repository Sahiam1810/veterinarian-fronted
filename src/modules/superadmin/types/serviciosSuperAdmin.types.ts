export type EstadoServicio = 'Activo' | 'Inactivo'

export interface ServicioSuperAdmin {
  id: string
  name: string
  description: string
  duration: number // in minutes
  price: number
  status: EstadoServicio
}

export interface ServicioFormData {
  name: string
  description: string
  duration: number
  price: number
  status: EstadoServicio
}
