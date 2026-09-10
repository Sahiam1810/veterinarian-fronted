import assert from 'node:assert/strict'
import test from 'node:test'

import {
  mapAppointmentsSummaryToVm,
  mapTopServicesToVm,
} from '../../src/modules/superadmin/utils/reportesApiMappers.ts'

test('mapAppointmentsSummaryToVm mapea correctamente la respuesta de /api/Reports/summary', () => {
  const simulatedApiResponse = {
    from: '2026-09-01',
    to: '2026-09-30',
    totalAppointments: 25,
    attendedCount: 18,
    canceledCount: 3,
    noShowCount: 1,
    scheduledCount: 3,
    attendanceRate: 72.0,
    topServiceName: 'Consulta General',
    topServiceCount: 12,
    topServicePercentage: 48.0,
  }

  const vm = mapAppointmentsSummaryToVm(simulatedApiResponse)

  assert.equal(vm.from, '2026-09-01')
  assert.equal(vm.to, '2026-09-30')
  assert.equal(vm.totalAppointments, 25)
  assert.equal(vm.attendedCount, 18)
  assert.equal(vm.canceledCount, 3)
  assert.equal(vm.noShowCount, 1)
  assert.equal(vm.scheduledCount, 3)
  assert.equal(vm.attendanceRate, 72.0)
  assert.equal(vm.topServiceName, 'Consulta General')
  assert.equal(vm.topServiceCount, 12)
  assert.equal(vm.topServicePercentage, 48.0)
})

test('mapAppointmentsSummaryToVm maneja respuestas nulas o parciales con valores por defecto seguros', () => {
  const fallbackRange = { from: '2026-01-01', to: '2026-01-31' }
  const nullVm = mapAppointmentsSummaryToVm(null, fallbackRange)

  assert.equal(nullVm.from, '2026-01-01')
  assert.equal(nullVm.to, '2026-01-31')
  assert.equal(nullVm.totalAppointments, 0)
  assert.equal(nullVm.attendedCount, 0)
  assert.equal(nullVm.canceledCount, 0)
  assert.equal(nullVm.noShowCount, 0)
  assert.equal(nullVm.scheduledCount, 0)
  assert.equal(nullVm.attendanceRate, 0)
  assert.equal(nullVm.topServiceName, null)
  assert.equal(nullVm.topServiceCount, 0)
  assert.equal(nullVm.topServicePercentage, 0)

  const partialVm = mapAppointmentsSummaryToVm({ totalAppointments: 5 })
  assert.equal(partialVm.totalAppointments, 5)
  assert.equal(partialVm.attendanceRate, 0)
  assert.equal(partialVm.topServiceName, null)
})

test('mapTopServicesToVm mapea correctamente la lista de /api/Reports/top-services', () => {
  const simulatedTopServices = [
    {
      serviceId: 'srv-1',
      serviceName: 'Vacunación Antirrábica',
      appointmentsCount: 15,
      percentage: 50.0,
    },
    {
      serviceId: 'srv-2',
      serviceName: 'Desparasitación',
      appointmentsCount: 9,
      percentage: 30.0,
    },
    {
      serviceId: 'srv-3',
      serviceName: 'Cirugía Menor',
      appointmentsCount: 6,
      percentage: 20.0,
    },
  ]

  const vmList = mapTopServicesToVm(simulatedTopServices)

  assert.equal(vmList.length, 3)
  assert.equal(vmList[0].serviceId, 'srv-1')
  assert.equal(vmList[0].serviceName, 'Vacunación Antirrábica')
  assert.equal(vmList[0].appointmentsCount, 15)
  assert.equal(vmList[0].percentage, 50.0)

  assert.equal(vmList[1].serviceName, 'Desparasitación')
  assert.equal(vmList[2].serviceName, 'Cirugía Menor')
})

test('mapTopServicesToVm maneja listas vacías, nulas o elementos incompletos', () => {
  assert.deepEqual(mapTopServicesToVm(null), [])
  assert.deepEqual(mapTopServicesToVm(undefined), [])
  assert.deepEqual(mapTopServicesToVm([]), [])

  const partialItems = mapTopServicesToVm([
    { serviceName: 'Peluquería' },
    { serviceId: 'srv-custom' },
  ])

  assert.equal(partialItems.length, 2)
  assert.equal(partialItems[0].serviceId, 'service-0')
  assert.equal(partialItems[0].serviceName, 'Peluquería')
  assert.equal(partialItems[0].appointmentsCount, 0)
  assert.equal(partialItems[0].percentage, 0)

  assert.equal(partialItems[1].serviceId, 'srv-custom')
  assert.equal(partialItems[1].serviceName, '—')
})
