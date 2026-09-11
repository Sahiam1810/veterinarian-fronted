import type { EstadoMascota, SuperAdminDueno } from '../types/mascotasSuperAdmin.types'

// Estado de los 7 campos del DuenoDrawer (edición o registro).
export type DuenoDrawerFormState = {
  name: string
  documentId: string
  email: string
  phone: string
  address: string
  city: string
  status: EstadoMascota
}

export type DuenoDrawerSource = Pick<
  SuperAdminDueno,
  'name' | 'documentId' | 'email' | 'phone' | 'address' | 'city' | 'status'
>

// Rellena el formulario desde el dueño editado, o valores por defecto en modo registrar (S33).
export function buildDuenoDrawerFormState(
  editingDueno: DuenoDrawerSource | null,
): DuenoDrawerFormState {
  if (editingDueno) {
    return {
      name: editingDueno.name,
      documentId: editingDueno.documentId,
      email: editingDueno.email,
      phone: editingDueno.phone,
      address: editingDueno.address,
      city: editingDueno.city,
      status: editingDueno.status,
    }
  }

  return {
    name: '',
    documentId: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bogotá',
    status: 'Activo',
  }
}
