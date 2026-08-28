import { useEffect } from 'react'
import { ClienteHistorialView } from '../../components'
import { useClienteHistorial } from '../../hooks'

interface HistorialPageProps {
  onNotice?: (message: string) => void
  onNavigateCitas?: () => void
}

export function HistorialPage({ onNotice, onNavigateCitas }: HistorialPageProps) {
  const {
    pets,
    selectedPetId,
    selectedRecord,
    isLoading,
    error,
    notice,
    handleSelectPet,
    handleScheduleVaccineAppointment,
  } = useClienteHistorial(true, onNavigateCitas)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading) {
    return <p className="text-sm text-sage font-medium">Cargando historial clínico…</p>
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
      <ClienteHistorialView
        pets={pets}
        selectedPetId={selectedPetId}
        selectedRecord={selectedRecord}
        onSelectPet={handleSelectPet}
        onScheduleVaccineAppointment={handleScheduleVaccineAppointment}
      />
    </div>
  )
}
