import type { ModuleId } from '../types'

export function normalizeModuleName(name: string): ModuleId | null {
  const norm = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
  if (norm.includes('usuario')) return 'usuarios'
  if (norm.includes('especie') || norm.includes('raza')) return 'especiesRazas'
  if (norm.includes('mascota')) return 'mascotas'
  if (norm.includes('dueño') || norm.includes('dueno') || norm.includes('cliente')) return 'duenos'
  if (norm.includes('servicio')) return 'servicios'
  if (norm.includes('profesional') || norm.includes('veterinar')) return 'profesionales'
  if (norm.includes('disponib')) return 'disponibilidad'
  if (norm.includes('cita') || norm.includes('agenda')) return 'agenda'
  if (norm.includes('historial') || norm.includes('historia')) return 'historiaClinica'
  if (norm.includes('reporte')) return 'reportes'
  if (norm.includes('orden')) return 'ordenesMedicas'
  if (norm.includes('insumo')) return 'insumos'
  if (norm.includes('hospital')) return 'hospitalizacion'
  return null
}
