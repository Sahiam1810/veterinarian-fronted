import { useEffect } from 'react'
import { RecepAgendaView } from '../../components'
import { useRecepAgenda } from '../../hooks'

interface AgendaPageProps {
  onNotice?: (message: string) => void
}

// Página Agenda y Citas del recepcionista
export function AgendaPage({ onNotice }: AgendaPageProps) {
  const {
    catalog,
    form,
    isLoading,
    error,
    notice,
    matchedOwners,
    selectedOwner,
    petsForOwner,
    selectedPet,
    selectedService,
    selectedProfessional,
    summaryWhen,
    isDayPanelOpen,
    dayAppointments,
    isDayLoading,
    dayPanelTitle,
    dayPanelDate,
    updateForm,
    handleOwnerQueryChange,
    handleSelectOwnerSuggestion,
    handleConfirm,
    handleCancel,
    handleOpenDayPanel,
    handleCloseDayPanel,
    handleChangeDayPanelDate,
    handleEditAppointment,
  } = useRecepAgenda(true)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading) {
    return <p className="text-sm text-sage font-medium">Cargando agenda…</p>
  }

  if (error) {
    return (
      <p className="text-sm text-danger font-medium" role="alert">
        {error}
      </p>
    )
  }

  if (!catalog) return null

  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden">
      <RecepAgendaView
        form={form}
        ownerSuggestions={matchedOwners}
        petsForOwner={petsForOwner}
        services={catalog.services}
        professionals={catalog.professionals}
        timeSlots={catalog.timeSlots}
        selectedOwnerName={selectedOwner?.name ?? null}
        selectedPetLabel={
          selectedPet ? `${selectedPet.name} (${selectedPet.breed})` : null
        }
        selectedServiceLabel={selectedService?.label ?? null}
        selectedProfessionalName={selectedProfessional?.name ?? null}
        summaryWhen={summaryWhen}
        isDayPanelOpen={isDayPanelOpen}
        dayAppointments={dayAppointments}
        isDayLoading={isDayLoading}
        dayPanelTitle={dayPanelTitle}
        dayPanelDate={dayPanelDate}
        onOwnerQueryChange={handleOwnerQueryChange}
        onSelectOwnerSuggestion={handleSelectOwnerSuggestion}
        onPetChange={(petId) => updateForm('petId', petId)}
        onServiceChange={(serviceId) => updateForm('serviceId', serviceId)}
        onProfessionalChange={(professionalId) =>
          updateForm('professionalId', professionalId)
        }
        onDateChange={(value) => updateForm('dateValue', value)}
        onTimeSlotChange={(slotId) => updateForm('timeSlotId', slotId)}
        onNotesChange={(value) => updateForm('notes', value)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onOpenDayPanel={handleOpenDayPanel}
        onCloseDayPanel={handleCloseDayPanel}
        onChangeDayPanelDate={handleChangeDayPanelDate}
        onEditAppointment={handleEditAppointment}
      />
    </div>
  )
}
