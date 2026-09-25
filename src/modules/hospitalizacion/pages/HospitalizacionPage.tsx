import { useState } from 'react'
import { HospitalizacionListaView } from '../components/HospitalizacionListaView'
import { HospitalizacionDetalleView } from '../components/HospitalizacionDetalleView'

export interface HospitalizacionPageProps {
  canView?: boolean
  canCreate?: boolean
  canEdit?: boolean
  canViewSupplies?: boolean
  canCreateSupplies?: boolean
}

export function HospitalizacionPage({
  canView = false,
  canCreate = false,
  canEdit = false,
  canViewSupplies = false,
  canCreateSupplies = false,
}: HospitalizacionPageProps) {
  const [selectedStayId, setSelectedStayId] = useState<string | null>(null)

  if (selectedStayId) {
    return (
      <HospitalizacionDetalleView
        stayId={selectedStayId}
        canView={canView}
        canEdit={canEdit}
        canViewSupplies={canViewSupplies}
        canCreateSupplies={canCreateSupplies}
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
    />
  )
}

