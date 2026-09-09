import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildSummaryFromByStatus,
  mapAppointmentsByStatusToVm,
} from '../../src/modules/superadmin/utils/reportesApiMappers.ts'
import { resolveStatusBarClassName } from '../../src/modules/superadmin/utils/reportesStatusBar.ts'

test('mapAppointmentsByStatusToVm incluye estados en 0 y barra del catálogo de 6', () => {
  const mapped = mapAppointmentsByStatusToVm([
    { statusId: '1', statusName: 'AGENDADA', count: 4, percentage: 40 },
    { statusId: '2', statusName: 'CONFIRMADA', count: 0, percentage: 0 },
    { statusId: '3', statusName: 'EN_PROGRESO', count: 1, percentage: 10 },
    { statusId: '4', statusName: 'ATENDIDA', count: 3, percentage: 30 },
    { statusId: '5', statusName: 'CANCELADA', count: 2, percentage: 20 },
    { statusId: '6', statusName: 'NO_ASISTIO', count: 0, percentage: 0 },
  ])

  assert.equal(mapped.length, 6)
  assert.equal(mapped.find((s) => s.statusName === 'CONFIRMADA')?.count, 0)
  assert.equal(mapped.find((s) => s.statusName === 'NO_ASISTIO')?.count, 0)
  assert.equal(mapped.find((s) => s.statusName === 'ATENDIDA')?.barClassName, 'bg-terracotta')
  assert.equal(mapped.find((s) => s.statusName === 'AGENDADA')?.barClassName, 'bg-brand/60')
  assert.equal(resolveStatusBarClassName('no_asistio'), 'bg-charcoal/40')
})

test('buildSummaryFromByStatus deriva KPIs desde los 6 estados reales', () => {
  const byStatus = mapAppointmentsByStatusToVm([
    { statusId: '1', statusName: 'AGENDADA', count: 2, percentage: 20 },
    { statusId: '2', statusName: 'CONFIRMADA', count: 1, percentage: 10 },
    { statusId: '3', statusName: 'EN_PROGRESO', count: 1, percentage: 10 },
    { statusId: '4', statusName: 'ATENDIDA', count: 4, percentage: 40 },
    { statusId: '5', statusName: 'CANCELADA', count: 1, percentage: 10 },
    { statusId: '6', statusName: 'NO_ASISTIO', count: 1, percentage: 10 },
  ])

  const summary = buildSummaryFromByStatus(
    { from: '2026-09-01', to: '2026-09-30' },
    byStatus,
    [{ serviceId: 's1', serviceName: 'Consulta', appointmentsCount: 3, percentage: 30 }],
  )

  assert.equal(summary.totalAppointments, 10)
  assert.equal(summary.attendedCount, 4)
  assert.equal(summary.canceledCount, 1)
  assert.equal(summary.noShowCount, 1)
  assert.equal(summary.scheduledCount, 4)
  assert.equal(summary.attendanceRate, 40)
  assert.equal(summary.topServiceName, 'Consulta')
})
