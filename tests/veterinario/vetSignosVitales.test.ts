import assert from 'node:assert/strict'
import test from 'node:test'

import { buildVetHomeDashboard } from '../../src/modules/veterinario/utils/buildVetHomeDashboard.ts'
import { buildVetAgendaPayload } from '../../src/modules/veterinario/utils/buildVetAgenda.ts'
import type { ApiAppointment } from '../../src/modules/veterinario/api/apiTypes.ts'

test('buildVetHomeDashboard mapea los 4 signos vitales tomados en recepción si están presentes', () => {
  const now = new Date('2026-09-22T10:00:00')
  const mockApt: ApiAppointment = {
    id: 'apt-1',
    veterinarianId: 'vet-1',
    serviceId: 'srv-1',
    serviceName: 'Consulta General',
    statusId: 'st-1',
    statusName: 'AGENDADA',
    availabilityId: 'av-1',
    clientPetId: 'cp-1',
    scheduledStart: '2026-09-22T10:30:00',
    scheduledEnd: '2026-09-22T11:00:00',
    createdAt: '2026-09-20T08:00:00Z',
    weightKg: 12.4,
    temperature: 38.8,
    heartRate: 105,
    respiratoryRate: 22,
  }

  const dashboard = buildVetHomeDashboard({
    profile: {
      personId: 'vet-1',
      userAccountId: 'vet-1',
      fullName: 'Dr. House',
      initials: 'DH',
      userName: 'drhouse',
      email: 'drhouse@vet.com',
      role: 'VETERINARIO',
      accountStatus: 'ACTIVE',
    },
    veterinarian: {
      id: 'vet-1',
      userId: 'vet-1',
      userFullName: 'Dr. House',
      specialtyId: 'sp-1',
      licenseNumber: 'VET-12345',
      createdAt: '2026-01-01T00:00:00Z',
    },
    appointments: [mockApt],
    clientPets: [
      {
        id: 'cp-1',
        clientId: 'c-1',
        petId: 'p-1',
        isPrimaryOwner: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    clients: [
      {
        id: 'c-1',
        fullName: 'Carlos Sanchez',
        email: 'carlos@mail.com',
        identificationNumber: '123456',
        phoneNumber: '3001234567',
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    pets: [
      {
        id: 'p-1',
        name: 'Max',
        speciesId: 'sp-1',
        raceId: 'rc-1',
        age: 3,
        gender: 'M',
        weight: 12.4,
      },
    ],
    species: [{ id: 'sp-1', name: 'Canino' }],
    races: [{ id: 'rc-1', name: 'Golden Retriever' }],
    now,
  })

  assert.equal(dashboard.appointments.length, 1)
  const item = dashboard.appointments[0]
  assert.equal(item.id, 'apt-1')
  assert.equal(item.petName, 'Max')
  assert.equal(item.weightKg, 12.4)
  assert.equal(item.temperature, 38.8)
  assert.equal(item.heartRate, 105)
  assert.equal(item.respiratoryRate, 22)
})

test('buildVetAgendaPayload mapea los 4 signos vitales en los eventos de la agenda', () => {
  const mockApt: ApiAppointment = {
    id: 'apt-2',
    veterinarianId: 'vet-1',
    serviceId: 'srv-1',
    serviceName: 'Vacunación',
    statusId: 'st-2',
    statusName: 'EN_ESPERA',
    availabilityId: 'av-2',
    clientPetId: 'cp-2',
    scheduledStart: '2026-09-22T14:00:00',
    scheduledEnd: '2026-09-22T14:30:00',
    createdAt: '2026-09-20T08:00:00Z',
    weightKg: 4.8,
    temperature: 39.1,
    heartRate: 130,
    respiratoryRate: 28,
  }

  const agenda = buildVetAgendaPayload({
    viewMode: 'dia',
    anchorDate: new Date('2026-09-22T00:00:00'),
    appointments: [mockApt],
    availabilities: [],
    pets: [
      {
        id: 'p-2',
        name: 'Misu',
        speciesId: 'sp-2',
        raceId: 'rc-2',
        age: 2,
        gender: 'H',
        weight: 4.8,
      },
    ],
    clientPets: [
      {
        id: 'cp-2',
        clientId: 'c-2',
        petId: 'p-2',
        isPrimaryOwner: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    species: [{ id: 'sp-2', name: 'Felino' }],
    now: new Date('2026-09-22T10:00:00'),
  })

  const aptEvents = agenda.events.filter((e) => e.status !== 'BLOQUEO')
  assert.equal(aptEvents.length, 1)
  const event = aptEvents[0]
  assert.equal(event.id, 'apt-2')
  assert.equal(event.petName, 'Misu')
  assert.equal(event.weightKg, 4.8)
  assert.equal(event.temperature, 39.1)
  assert.equal(event.heartRate, 130)
  assert.equal(event.respiratoryRate, 28)
})
