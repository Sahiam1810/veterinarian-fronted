import assert from 'node:assert/strict'
import test from 'node:test'

import { isStayActive } from '../../src/modules/hospitalizacion/utils/hospitalizacionView.ts'
import type { ApiHospitalizationStay } from '../../src/modules/hospitalizacion/types/hospitalizacion.types.ts'

test('isStayActive returns true for active stay without dischargedAt', () => {
  const activeStay: ApiHospitalizationStay = {
    id: 'stay-1',
    clientPetId: 'cp-1',
    petName: 'Rocky',
    ownerName: 'Juan Pérez',
    appointmentId: null,
    admittedAt: '2026-09-24T10:00:00Z',
    dischargedAt: null,
    status: 'Activa',
    motivo: 'Observación post-quirúrgica',
    admittedByUserId: 'usr-1',
    admittedByName: 'Dr. Silva',
  }

  assert.equal(isStayActive(activeStay), true)
})

test('isStayActive returns false for discharged stay', () => {
  const dischargedStay: ApiHospitalizationStay = {
    id: 'stay-2',
    clientPetId: 'cp-1',
    petName: 'Rocky',
    ownerName: 'Juan Pérez',
    appointmentId: null,
    admittedAt: '2026-09-24T10:00:00Z',
    dischargedAt: '2026-09-24T18:00:00Z',
    status: 'Dada de alta',
    motivo: 'Observación post-quirúrgica',
    admittedByUserId: 'usr-1',
    admittedByName: 'Dr. Silva',
  }

  assert.equal(isStayActive(dischargedStay), false)
})

test('isStayActive returns false for null or undefined stay', () => {
  assert.equal(isStayActive(null), false)
  assert.equal(isStayActive(undefined), false)
})
