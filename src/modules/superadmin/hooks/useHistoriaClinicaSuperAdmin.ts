import { useState, useEffect, useCallback } from 'react'
import type { SuperAdminMascota, HistoriaClinicaData } from '../types'
import {
  fetchMedicalRecords,
  fetchVaccinations,
  fetchDiagnostics,
  fetchAppointments,
  fetchVeterinarians,
} from '../services'
import { mapMedicalRecordToConsulta, mapVaccinationToVacuna } from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'

export function useHistoriaClinicaSuperAdmin(mascota: SuperAdminMascota | null) {
  const [historia, setHistoria] = useState<HistoriaClinicaData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHistoria = useCallback(async (target: SuperAdminMascota) => {
    setIsLoading(true)
    setError(null)
    try {
      const [records, vaccinations, diagnostics, appointments, veterinarians] = await Promise.all([
        fetchMedicalRecords(),
        fetchVaccinations(),
        fetchDiagnostics(false),
        fetchAppointments(),
        fetchVeterinarians(),
      ])

      const diagnosticsById = new Map(diagnostics.map((d) => [d.id, d]))
      const appointmentsById = new Map(appointments.map((a) => [a.id, a]))
      const veterinariansById = new Map(veterinarians.map((v) => [v.id, v]))

      const petRecords = records
        .filter((r) => r.clientPetId === target.clientPetId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      const petVaccinations = vaccinations
        .filter((v) => v.clientPetId === target.clientPetId)
        .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())

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
        petId: target.id,
        displayName: target.name,
        patientCode: `PAC-${target.id.slice(0, 8).toUpperCase()}`,
        sexLabel: target.sex === 'Macho' ? '♂ Macho' : '♀ Hembra',
        breed: `${target.species} • ${target.breed}`,
        ageLabel: target.age,
        weightLabel: target.weight,
        ownerName: target.ownerName,
        ownerPhone: target.ownerPhone,
        photoUrl: target.photoUrl,
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
      const message = err instanceof ApiError ? err.message : 'No se pudo cargar la historia clínica.'
      setError(message)
      setHistoria(null)
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
