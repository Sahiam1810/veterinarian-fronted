import assert from 'node:assert/strict'
import test from 'node:test'

import { isStayActive } from '../../src/modules/hospitalizacion/utils/hospitalizacionView.ts'
import type { ApiHospitalizationStay } from '../../src/modules/hospitalizacion/types/hospitalizacion.types.ts'
import {
  formatInvoiceDate,
  getInvoiceStayStatusBadge,
} from '../../src/modules/hospitalizacion/utils/hospitalizacionInvoiceUtils.ts'

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

test('stay status badges and discharge date formatting handle active and discharged stays', () => {
  const activeStay: ApiHospitalizationStay = {
    id: 'stay-1',
    clientPetId: 'cp-1',
    petName: 'Rocky',
    ownerName: 'Juan Pérez',
    appointmentId: null,
    admittedAt: '2026-09-24T10:00:00Z',
    dischargedAt: null,
    status: 'Activa',
    motivo: 'Observación',
    admittedByUserId: 'usr-1',
    admittedByName: 'Dr. Silva',
  }

  const activeBadge = getInvoiceStayStatusBadge(activeStay.status)
  assert.equal(activeBadge.label, 'Estancia Activa')
  assert.equal(activeStay.dischargedAt, null)

  const dischargedStay: ApiHospitalizationStay = {
    id: 'stay-2',
    clientPetId: 'cp-1',
    petName: 'Pelusa',
    ownerName: 'María Gomez',
    appointmentId: null,
    admittedAt: '2026-09-20T08:00:00Z',
    dischargedAt: '2026-09-24T18:00:00Z',
    status: 'Dada de alta',
    motivo: 'Cirugía',
    admittedByUserId: 'usr-1',
    admittedByName: 'Dr. Silva',
  }

  const dischargedBadge = getInvoiceStayStatusBadge(dischargedStay.status)
  assert.equal(dischargedBadge.label, 'Dada de alta')
  assert.notEqual(formatInvoiceDate(dischargedStay.dischargedAt), '-')
})


