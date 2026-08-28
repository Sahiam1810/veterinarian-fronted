import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ClienteMascotaDetail, ClienteMascotasPayload } from '../types'
import { fetchClienteMascotas } from '../services'

export function useClienteMascotas(enabled = true) {
  const [payload, setPayload] = useState<ClienteMascotasPayload | null>(null)
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
        const data = await fetchClienteMascotas()
        if (!cancelled) {
          setPayload(data)
          setSelectedPetId(data.pets[0]?.id ?? null)
        }
      } catch {
        if (!cancelled) setError('No se pudieron cargar tus mascotas')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [enabled])

  const selectedPet = useMemo<ClienteMascotaDetail | null>(() => {
    if (!payload || !selectedPetId) return payload?.pets[0] ?? null
    return payload.pets.find((pet) => pet.id === selectedPetId) ?? null
  }, [payload, selectedPetId])

  const handleSelectPet = useCallback((petId: string) => {
    setSelectedPetId(petId)
  }, [])

  const handleScheduleAppointment = useCallback((onNavigateCitas?: () => void) => {
    setNotice('Agendar nueva cita: redirigiendo a Mis Citas (mock)')
    onNavigateCitas?.()
  }, [])

  const handleModifyAppointment = useCallback((onNavigateCitas?: () => void) => {
    setNotice('Modificar cita: redirigiendo a Mis Citas (mock)')
    onNavigateCitas?.()
  }, [])

  const handleViewFullHistory = useCallback((onNavigateHistorial?: () => void) => {
    onNavigateHistorial?.()
  }, [])

  const handleDownloadCard = useCallback(() => {
    setNotice('Descarga de cartilla disponible próximamente (mock)')
  }, [])

  const handleShareProfile = useCallback(() => {
    setNotice('Compartir perfil disponible próximamente (mock)')
  }, [])

  return {
    pets: payload?.pets ?? [],
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
  }
}
