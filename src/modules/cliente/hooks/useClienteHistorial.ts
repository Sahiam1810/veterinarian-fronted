import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ClienteHistorialPayload, ClienteHistorialPetRecord } from '../types'
import { fetchClienteHistorial } from '../services'

export function useClienteHistorial(enabled = true, onNavigateCitas?: () => void) {
  const [payload, setPayload] = useState<ClienteHistorialPayload | null>(null)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchClienteHistorial()
        if (!cancelled) {
          setPayload(data)
          setSelectedPetId(data.pets[0]?.pet.id ?? null)
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el historial clínico')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [enabled])

  const selectedRecord = useMemo<ClienteHistorialPetRecord | null>(() => {
    if (!payload || !selectedPetId) return null
    return payload.pets.find((record) => record.pet.id === selectedPetId) ?? null
  }, [payload, selectedPetId])

  const handleSelectPet = useCallback((petId: string) => {
    setSelectedPetId(petId)
  }, [])

  const handleScheduleVaccineAppointment = useCallback(() => {
    setNotice('Agendar cita para vacuna: solicitud enviada (mock)')
    onNavigateCitas?.()
  }, [onNavigateCitas])

  return {
    pets: payload?.pets ?? [],
    selectedPetId,
    selectedRecord,
    isLoading,
    error,
    notice,
    handleSelectPet,
    handleScheduleVaccineAppointment,
  }
}
