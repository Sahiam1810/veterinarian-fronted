import assert from 'node:assert/strict'
import test from 'node:test'

import {
  emptyHistoriaFromPet,
  resolveHistoriaLoadError,
} from '../../src/modules/superadmin/hooks/useHistoriaClinicaSuperAdmin.ts'
import { ApiError } from '../../src/services/apiClient.ts'
import type { SuperAdminMascota } from '../../src/modules/superadmin/types/mascotasSuperAdmin.types.ts'

function makeMascota(overrides: Partial<SuperAdminMascota> = {}): SuperAdminMascota {
  return {
    id: 'pet-1',
    name: 'Milusita',
    species: 'Canino',
    breed: 'Criollo / Mestizo',
    age: '7 años',
    sex: 'Hembra',
    weight: '5 kg',
    ownerId: 'owner-1',
    ownerName: 'Susan Cardenas',
    ownerPhone: '3333333333',
    status: 'Activo',
    registrationDate: '2026-09-11T00:00:00Z',
    clientPetId: 'cp-1',
    ...overrides,
  }
}

// S32: una mascota sin historia real debe verse en blanco, no con datos inventados.
test('emptyHistoriaFromPet no inventa consultas ni vacunas (bug original: datos demo)', () => {
  const historia = emptyHistoriaFromPet(makeMascota())

  assert.deepEqual(historia.consultas, [])
  assert.deepEqual(historia.vacunas, [])
  assert.equal(historia.signosVitales.temperatura, 'No registrado')
  assert.equal(historia.signosVitales.frecuenciaCardiaca, 'No registrado')
  assert.equal(historia.signosVitales.frecuenciaRespiratoria, 'No registrado')
  assert.equal(historia.signosVitales.mucosas, 'No registrado')
})

test('emptyHistoriaFromPet refleja los datos reales de la mascota en la ficha base', () => {
  const historia = emptyHistoriaFromPet(
    makeMascota({ name: 'Milu', ownerName: 'Susan Cardenas', ownerPhone: '3333333333' }),
  )

  assert.equal(historia.displayName, 'Milu')
  assert.equal(historia.ownerName, 'Susan Cardenas')
  assert.equal(historia.ownerPhone, '3333333333')
})

test('resolveHistoriaLoadError traduce un ApiError real en vez de ocultarlo con datos falsos', () => {
  const err = new ApiError('Recurso no encontrado.', 404)
  const message = resolveHistoriaLoadError(err)

  assert.equal(typeof message, 'string')
  assert.ok(message.length > 0)
})

test('resolveHistoriaLoadError da un mensaje genérico legible para errores no-API', () => {
  const message = resolveHistoriaLoadError(new Error('boom'))
  assert.equal(message, 'No se pudo cargar toda la historia clínica.')
})
