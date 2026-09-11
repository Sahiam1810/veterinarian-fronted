import assert from 'node:assert/strict'
import test from 'node:test'

import { getCitaDetalleFooterActions, isCitaAgendada } from '../../src/modules/superadmin/utils/citaDetalleActions.ts'
import type { EstadoCita } from '../../src/modules/superadmin/types/agendaSuperAdmin.types.ts'

const closedStatuses: EstadoCita[] = ['ATENDIDA', 'CANCELADA', 'NO_ASISTIO', 'EN_ESPERA', 'BLOQUEO']

test('isCitaAgendada solo es true para AGENDADA', () => {
  assert.equal(isCitaAgendada('AGENDADA'), true)
  for (const status of closedStatuses) {
    assert.equal(isCitaAgendada(status), false)
  }
})

test('el footer del detalle muestra Reprogramar/Cancelar/Atendida/No Asistió solo si AGENDADA', () => {
  const abierta = getCitaDetalleFooterActions('AGENDADA')
  assert.deepEqual(abierta, {
    showCancelar: true,
    showReprogramar: true,
    showMarcarAtendida: true,
    showMarcarNoAsistio: true,
  })

  for (const status of closedStatuses) {
    const actions = getCitaDetalleFooterActions(status)
    assert.equal(actions.showCancelar, false, status)
    assert.equal(actions.showReprogramar, false, status)
    assert.equal(actions.showMarcarAtendida, false, status)
    assert.equal(actions.showMarcarNoAsistio, false, status)
  }
})
