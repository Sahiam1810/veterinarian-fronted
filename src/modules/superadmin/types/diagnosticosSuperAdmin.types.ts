// Tipos UI del catálogo de diagnósticos (SuperAdmin)
export type EstadoDiagnostico = 'Activo' | 'Inactivo'

export interface DiagnosticoCatalogo {
  id: string
  code: string
  name: string
  description: string
  status: EstadoDiagnostico
}

export interface DiagnosticoFormData {
  code: string
  name: string
  description: string
  status: EstadoDiagnostico
}
