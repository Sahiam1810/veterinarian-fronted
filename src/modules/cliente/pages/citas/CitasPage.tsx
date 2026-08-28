import { useEffect } from 'react'
import { ClienteCitasView } from '../../components'
import { useClienteCitas } from '../../hooks'

interface CitasPageProps {
  onNotice?: (message: string) => void
}

export function CitasPage({ onNotice }: CitasPageProps) {
  const {
    filteredItems,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    notice,
    handleNewAppointment,
    handleRescheduleAppointment,
    handleCancelAppointment,
  } = useClienteCitas(true)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading) {
    return <p className="text-sm text-sage font-medium">Cargando citas…</p>
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
      <ClienteCitasView
        items={filteredItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewAppointment={handleNewAppointment}
        onRescheduleAppointment={handleRescheduleAppointment}
        onCancelAppointment={handleCancelAppointment}
      />
    </div>
  )
}
