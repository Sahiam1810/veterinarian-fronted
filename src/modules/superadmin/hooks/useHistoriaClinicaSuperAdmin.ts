import { useState, useEffect, useCallback } from 'react'
import type { SuperAdminMascota, HistoriaClinicaData } from '../types'
import { fetchMedicalRecords } from '../services/superAdminMedicalRecordsService.ts'
import { fetchVaccinations } from '../services/superAdminVaccinationsService.ts'
import { fetchDiagnostics } from '../services/superAdminCatalogService.ts'
import { fetchAppointments } from '../services/superAdminAppointmentsService.ts'
import { fetchVeterinarians } from '../services/superAdminVeterinariansService.ts'
import { mapMedicalRecordToConsulta, mapVaccinationToVacuna } from '../utils/superAdminApiMappers.ts'
import { ApiError } from '../../../services/apiClient.ts'
import { translateUserApiError } from '../utils/translateUserApiError.ts'

// Ficha vacía real (sin datos de ejemplo) para una mascota sin historia clínica registrada.
export function emptyHistoriaFromPet(mascota: SuperAdminMascota): HistoriaClinicaData {
  return {
    petId: mascota.id,
    displayName: mascota.name,
    patientCode: `PAC-${mascota.id.slice(0, 8).toUpperCase()}`,
    sexLabel: mascota.sex === 'Macho' ? '♂ Macho' : '♀ Hembra',
    breed: `${mascota.species} • ${mascota.breed}`,
    ageLabel: mascota.age,
    weightLabel: mascota.weight,
    ownerName: mascota.ownerName || 'Sin dueño',
    ownerPhone: mascota.ownerPhone || 'No registrado',
    photoUrl: mascota.photoUrl,
    consultas: [],
    vacunas: [],
    signosVitales: {
      temperatura: 'No registrado',
      frecuenciaCardiaca: 'No registrado',
      frecuenciaRespiratoria: 'No registrado',
      mucosas: 'No registrado',
    },
  }
}

// Mensaje real de error al cargar la historia clínica (ya no se sustituye por datos falsos).
export function resolveHistoriaLoadError(err: unknown): string {
  return err instanceof ApiError
    ? translateUserApiError(err.message)
    : 'No se pudo cargar toda la historia clínica.'
}

async function settledValue<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise
  } catch {
    return fallback
  }
}

export function useHistoriaClinicaSuperAdmin(mascota: SuperAdminMascota | null) {
  const [historia, setHistoria] = useState<HistoriaClinicaData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHistoria = useCallback(async (target: SuperAdminMascota) => {
    setIsLoading(true)
    setError(null)

    // Siempre armamos la ficha con los datos de la mascota; las APIs enriquecen consultas/vacunas.
    const base = emptyHistoriaFromPet(target)

    try {
      const [records, vaccinations, diagnostics, appointments, veterinarians] = await Promise.all([
        settledValue(fetchMedicalRecords(), []),
        settledValue(fetchVaccinations(), []),
        settledValue(fetchDiagnostics(false), []),
        settledValue(fetchAppointments(), []),
        settledValue(fetchVeterinarians(), []),
      ])

      const diagnosticsById = new Map(diagnostics.map((d) => [d.id, d]))
      const appointmentsById = new Map(appointments.map((a) => [a.id, a]))
      const veterinariansById = new Map(veterinarians.map((v) => [v.id, v]))

      const petKey = target.clientPetId
      const petRecords = petKey
        ? records
            .filter((r) => r.clientPetId === petKey)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : []

      const petVaccinations = petKey
        ? vaccinations
            .filter((v) => v.clientPetId === petKey)
            .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
        : []

      const consultas = petRecords.map((record) => {
        const appointment = appointmentsById.get(record.appointmentId)
        const veterinarian = appointment ? veterinariansById.get(appointment.veterinarianId) : undefined
        const diagnostic = diagnosticsById.get(record.diagnosticId)
        const diagnosticLabel = diagnostic
          ? [diagnostic.code, diagnostic.name].filter(Boolean).join(' - ') || undefined
          : record.diagnosticCode ?? undefined

        return mapMedicalRecordToConsulta(record, {
          serviceName: appointment?.serviceName,
          veterinarianName: veterinarian?.userFullName,
          diagnosticLabel,
        })
      })

      const vacunas = petVaccinations.map(mapVaccinationToVacuna)

      const latestWithVitals = petRecords.find((r) => r.temperature != null)

      setHistoria({
        ...base,
        consultas,
        vacunas,
        signosVitales: {
          temperatura: latestWithVitals ? `${latestWithVitals.temperature} °C` : 'No registrado',
          frecuenciaCardiaca: 'No registrado',
          frecuenciaRespiratoria: 'No registrado',
          mucosas: 'No registrado',
        },
      })
    } catch (err) {
      const message = resolveHistoriaLoadError(err)
      setHistoria(base)
      setError(message)
      console.warn(message, err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mascota) {
      void loadHistoria(mascota)
    } else {
      setHistoria(null)
      setError(null)
    }
  }, [mascota, loadHistoria])

  return {
    historia,
    isLoading,
    error,
    reload: mascota ? () => loadHistoria(mascota) : () => {},
  }
}
