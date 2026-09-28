import { useState } from 'react'
import { HospitalizacionListaView } from '../components/HospitalizacionListaView'
import { HospitalizacionDetalleView } from '../components/HospitalizacionDetalleView'

export interface HospitalizacionPageProps {
  canView?: boolean
  canCreate?: boolean
  canEdit?: boolean
  canViewSupplies?: boolean
  canCreateSupplies?: boolean
  canViewOrders?: boolean
  canCreateOrders?: boolean
  canEditOrders?: boolean
  canManageSettings?: boolean
  canDischarge?: boolean
  canRegisterPayment?: boolean
}

export function HospitalizacionPage({
  canView = false,
  canCreate = false,
  canEdit = false,
  canViewSupplies = false,
  canCreateSupplies = false,
  canViewOrders = false,
  canCreateOrders = false,
  canEditOrders = false,
  canManageSettings = false,
  canDischarge = false,
  canRegisterPayment = false,
}: HospitalizacionPageProps) {
  const [selectedStayId, setSelectedStayId] = useState<string | null>(null)

  if (selectedStayId) {
    return (
      <HospitalizacionDetalleView
        stayId={selectedStayId}
        canView={canView}
        canCreate={canCreate}
        canEdit={canEdit}
        canViewSupplies={canViewSupplies}
        canCreateSupplies={canCreateSupplies}
        canViewOrders={canViewOrders}
        canCreateOrders={canCreateOrders}
        canEditOrders={canEditOrders}
        canDischarge={canDischarge}
        canRegisterPayment={canRegisterPayment}
        onBack={() => setSelectedStayId(null)}
      />
    )
  }


  return (
    <HospitalizacionListaView
      canView={canView}
      canCreate={canCreate}
      canEdit={canEdit}
      onSelectStay={(stayId) => setSelectedStayId(stayId)}
      canManageSettings={canManageSettings}
    />
  )
}

