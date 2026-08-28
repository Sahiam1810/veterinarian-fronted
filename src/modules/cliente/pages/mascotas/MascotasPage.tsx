import { useEffect } from 'react'
import { ClienteMascotasView } from '../../components'
import { useClienteMascotas } from '../../hooks'

interface MascotasPageProps {
  onNotice?: (message: string) => void
  onNavigateCitas?: () => void
  onNavigateHistorial?: () => void
}

export function MascotasPage({
  onNotice,
  onNavigateCitas,
  onNavigateHistorial,
}: MascotasPageProps) {
  const {
    pets,
    selectedPetId,
    selectedPet,
    isLoading,
    error,
    notice,
    handleSelectPet,
    handleScheduleAppointment,
    handleModifyAppointment,
    handleViewFullHistory,
    handleDownloadCard,
    handleShareProfile,
  } = useClienteMascotas(true)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading) {
    return <p className="text-sm text-sage font-medium">Cargando mascotas…</p>
  }

  if (error) {
    return (
      <p className="text-sm text-danger font-medium" role="alert">
        {error}
      </p>
    )
  }

  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden">
      <ClienteMascotasView
        pets={pets}
        selectedPetId={selectedPetId}
        selectedPet={selectedPet}
        onSelectPet={handleSelectPet}
        onScheduleAppointment={() => handleScheduleAppointment(onNavigateCitas)}
        onModifyAppointment={() => handleModifyAppointment(onNavigateCitas)}
        onViewFullHistory={() => handleViewFullHistory(onNavigateHistorial)}
        onDownloadCard={handleDownloadCard}
        onShareProfile={handleShareProfile}
      />
    </div>
  )
}
