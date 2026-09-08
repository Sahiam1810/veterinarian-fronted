import { useState, useEffect, useCallback } from 'react'
import type { SuperAdminMascota, HistoriaClinicaData, HistoriaConsulta, HistoriaVacuna } from '../types'
import {
  fetchMedicalRecords,
  fetchVaccinations,
  fetchDiagnostics,
  fetchAppointments,
  fetchVeterinarians,
} from '../services'
import { mapMedicalRecordToConsulta, mapVaccinationToVacuna } from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'
import { translateUserApiError } from '../utils/translateUserApiError'

// Datos de lectura de ejemplo cuando la mascota aún no tiene historia en Oracle.
function buildDemoConsultas(mascota: SuperAdminMascota): HistoriaConsulta[] {
  return [
    {
      id: `demo-consulta-1-${mascota.id}`,
      dateLabel: '15 de agosto de 2026',
      typeLabel: 'Consulta general',
      veterinarian: 'Dra. demo Huellitas',
      motivo: `Revisión de rutina de ${mascota.name}. Dueño reporta buen apetito y actividad normal.`,
      diagnostico: 'GEN - Paciente estable / sin hallazgos relevantes',
      tratamientoIndicaciones: [
        'Continuar alimentación habitual',
        'Control en 6 meses o ante cualquier síntoma',
      ],
    },
    {
      id: `demo-consulta-2-${mascota.id}`,
      dateLabel: '02 de junio de 2026',
      typeLabel: 'Control preventivo',
      veterinarian: 'Dr. demo Huellitas',
      motivo: 'Chequeo preventivo y desparasitación.',
      diagnostico: 'PREV - Profilaxis antiparasitaria',
      tratamientoIndicaciones: [
        'Desparasitante según peso actual',
        'Reforzar higiene del entorno',
      ],
    },
  ]
}

function buildDemoVacunas(mascota: SuperAdminMascota): HistoriaVacuna[] {
  return [
    {
      id: `demo-vacuna-1-${mascota.id}`,
      name: mascota.species === 'Felino' ? 'Triple felina' : 'Múltiple canina',
      appliedLabel: '02/06/26',
      nextLabel: '02/06/27',
    },
    {
      id: `demo-vacuna-2-${mascota.id}`,
      name: 'Antirrábica',
      appliedLabel: '02/06/26',
      nextLabel: '02/06/27',
    },
  ]
}

function emptyHistoriaFromPet(mascota: SuperAdminMascota): HistoriaClinicaData {
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

      let consultas = petRecords.map((record) => {
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

      let vacunas = petVaccinations.map(mapVaccinationToVacuna)

      // Sin historia real: datos de ejemplo para poder leer la ficha.
      const usingDemo = consultas.length === 0 && vacunas.length === 0
      if (usingDemo) {
        consultas = buildDemoConsultas(target)
        vacunas = buildDemoVacunas(target)
      }

      const latestWithVitals = petRecords.find((r) => r.temperature != null)

      setHistoria({
        ...base,
        consultas,
        vacunas,
        signosVitales: {
          temperatura: latestWithVitals
            ? `${latestWithVitals.temperature} °C`
            : usingDemo
              ? '38.5 °C'
              : 'No registrado',
          frecuenciaCardiaca: usingDemo ? '92 lpm' : 'No registrado',
          frecuenciaRespiratoria: usingDemo ? '24 rpm' : 'No registrado',
          mucosas: usingDemo ? 'Rosadas / húmedas' : 'No registrado',
        },
      })
    } catch (err) {
      // Si algo inesperado falla, igual mostramos la ficha básica + demo.
      const message =
        err instanceof ApiError
          ? translateUserApiError(err.message)
          : 'No se pudo cargar toda la historia clínica.'
      setHistoria({
        ...base,
        consultas: buildDemoConsultas(target),
        vacunas: buildDemoVacunas(target),
        signosVitales: {
          temperatura: '38.5 °C',
          frecuenciaCardiaca: '92 lpm',
          frecuenciaRespiratoria: '24 rpm',
          mucosas: 'Rosadas / húmedas',
        },
      })
      setError(null)
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
