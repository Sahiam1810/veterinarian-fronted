import type { ModuleId, ModuleInfo } from '../types'

export interface AdminNavItemMeta {
  id: string
  moduleId: ModuleId
  label: string
}

export const MODULES_INFO: ModuleInfo[] = [
  { id: 'usuarios', label: 'Usuarios', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'mascotas', label: 'Mascotas', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'duenos', label: 'Dueños', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'especiesRazas', label: 'Especies y Razas', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'servicios', label: 'Servicios', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'profesionales', label: 'Profesionales', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'ordenesMedicas', label: 'Órdenes Médicas', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'insumos', label: 'Insumos', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'hospitalizacion', label: 'Hospitalización', supportsCreate: true, supportsEdit: true, supportsDelete: false },
  { id: 'agenda', label: 'Agenda', supportsCreate: true, supportsEdit: true, supportsDelete: true },
  { id: 'historiaClinica', label: 'Historia Clínica', supportsCreate: true, supportsEdit: true, supportsDelete: false },
  { id: 'reportes', label: 'Reportes', supportsCreate: false, supportsEdit: false, supportsDelete: false },
]

export const SUPER_ADMIN_NAV_CATALOG: AdminNavItemMeta[] = [
  { id: 'inicio', moduleId: 'inicio', label: 'Inicio' },
  { id: 'usuarios', moduleId: 'usuarios', label: 'Usuarios' },
  { id: 'mascotas', moduleId: 'mascotas', label: 'Mascotas' },
  { id: 'duenos', moduleId: 'duenos', label: 'Dueños' },
  { id: 'especies-razas', moduleId: 'especiesRazas', label: 'Especies y razas' },
  { id: 'servicios', moduleId: 'servicios', label: 'Servicios' },
  { id: 'diagnosticos', moduleId: 'historiaClinica', label: 'Diagnósticos' },
  { id: 'profesionales', moduleId: 'profesionales', label: 'Profesionales' },
  { id: 'agenda', moduleId: 'agenda', label: 'Agenda' },
  { id: 'reportes', moduleId: 'reportes', label: 'Reportes' },
  { id: 'medicamentos', moduleId: 'ordenesMedicas', label: 'Medicamentos' },
  { id: 'procedimientos', moduleId: 'ordenesMedicas', label: 'Procedimientos' },
  { id: 'insumos', moduleId: 'insumos', label: 'Insumos' },
  { id: 'hospitalizacion', moduleId: 'hospitalizacion', label: 'Hospitalización' },
  { id: 'ordenes-pendientes', moduleId: 'ordenesMedicas', label: 'Órdenes Pendientes' },
]
