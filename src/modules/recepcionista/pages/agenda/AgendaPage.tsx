import { useEffect, useState } from 'react'
import { RecepAgendaView, RecepAgendamientoRapidoModal } from '../../components'
import { AppointmentReceiptModal } from '../../components/AppointmentReceiptModal'
import { useRecepAgenda } from '../../hooks'

interface AgendaPageProps {
  onNotice?: (message: string) => void
}

// Página Agenda y Citas del recepcionista
export function AgendaPage({ onNotice }: AgendaPageProps) {
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false)

  const {
    catalog,
    form,
    isLoading,
    error,
    notice,
    canCreate,
    canEdit,
    timeSlots,
    isLoadingSlots,
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
    handleMarkNoAsistio,
    handleCheckIn,
    handleRegisterPayment,
    isCitaPaid,
    reloadAppointments,
    receiptData,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
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
        timeSlots={timeSlots}
        isLoadingSlots={isLoadingSlots}
        selectedOwner={selectedOwner}
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
        isCitaPaid={isCitaPaid}
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
        onConfirm={canCreate ? handleConfirm : undefined}
        onCancel={handleCancel}
        onOpenQuickBooking={canCreate ? () => setIsQuickBookingOpen(true) : undefined}
        onOpenDayPanel={handleOpenDayPanel}
        onCloseDayPanel={handleCloseDayPanel}
        onChangeDayPanelDate={handleChangeDayPanelDate}
        onEditAppointment={canEdit ? handleEditAppointment : undefined}
        onMarkNoAsistio={canEdit ? handleMarkNoAsistio : undefined}
        onCheckIn={canEdit ? handleCheckIn : undefined}
        onRegistrarPago={canEdit ? handleRegisterPayment : undefined}
        onVitalsUpdated={reloadAppointments}
      />

      <AppointmentReceiptModal
        open={isReceiptModalOpen}
        onOpenChange={setIsReceiptModalOpen}
        receipt={receiptData}
      />

      <RecepAgendamientoRapidoModal
        isOpen={isQuickBookingOpen}
        onClose={() => setIsQuickBookingOpen(false)}
        onSuccess={(msg) => {
          onNotice?.(msg)
          void reloadAppointments()
        }}
      />
    </div>
  )
}

