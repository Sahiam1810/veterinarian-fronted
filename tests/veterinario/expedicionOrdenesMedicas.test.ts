import assert from 'node:assert/strict'
import test, { beforeEach, afterEach } from 'node:test'

import {
  setStoredUser,
} from '../../src/modules/auth/services/authService.ts'
import {
  fetchMedications,
  fetchProcedures,
  createMedicationOrder,
  createProcedureOrder,
  fetchMedicationOrdersByAppointment,
  type CreateMedicationOrderInput,
  type CreateProcedureOrderInput,
  type ApiMedicationOrder,
} from '../../src/modules/veterinario/services/ordenesMedicasService.ts'

const originalFetch = globalThis.fetch

beforeEach(() => {
  const localStore = new Map<string, string>()
  const sessionStore = new Map<string, string>()

  const createMemoryStorage = (store: Map<string, string>): Storage => ({
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    key(index: number) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  })

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: createMemoryStorage(localStore),
  })
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: createMemoryStorage(sessionStore),
  })

  setStoredUser(
    {
      id: 'vet-100',
      name: 'Dr. Alejandro Morales',
      email: 'vet@huellitas.com',
      role: 'veterinario',
      roleName: 'Veterinario',
      accessToken: 'test-token-vet',
    },
    true,
  )
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('crear una orden de medicamento envía el payload esperado a /api/medication-orders', async () => {
  const recordedCalls: { url: string; method: string; body: unknown }[] = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    recordedCalls.push({
      url,
      method: init?.method || 'GET',
      body: init?.body ? JSON.parse(init.body as string) : undefined,
    })

    return new Response(
      JSON.stringify({
        id: 'med-ord-new',
        clientPetId: 'cp-1',
        veterinarianId: 'vet-100',
        appointmentId: 'apt-1',
        hospitalizationStayId: null,
        isInHouse: true,
        status: 'Pendiente',
        createdAt: '2026-09-25T14:30:00Z',
        items: [
          {
            id: 'item-1',
            medicationOrderId: 'med-ord-new',
            medicationId: 'med-123',
            medicationName: 'Meloxicam Gotas',
            notes: '3 gotas cada 24h por 5 días',
          },
        ],
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const payload: CreateMedicationOrderInput = {
    clientPetId: 'cp-1',
    appointmentId: 'apt-1',
    hospitalizationStayId: null,
    isInHouse: true,
    referredTo: null,
    referralReason: null,
    items: [
      {
        medicationId: 'med-123',
        notes: '3 gotas cada 24h por 5 días',
      },
    ],
  }

  const result = await createMedicationOrder(payload)

  assert.equal(recordedCalls.length, 1)
  assert.match(recordedCalls[0].url, /\/api\/medication-orders$/)
  assert.equal(recordedCalls[0].method, 'POST')
  assert.deepEqual(recordedCalls[0].body, payload)
  assert.equal(result.id, 'med-ord-new')
  assert.equal(result.status, 'Pendiente')
})

test('crear una orden de procedimiento envía el payload esperado a /api/procedure-orders', async () => {
  const recordedCalls: { url: string; method: string; body: unknown }[] = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    recordedCalls.push({
      url,
      method: init?.method || 'GET',
      body: init?.body ? JSON.parse(init.body as string) : undefined,
    })

    return new Response(
      JSON.stringify({
        id: 'proc-ord-new',
        clientPetId: 'cp-1',
        veterinarianId: 'vet-100',
        appointmentId: 'apt-1',
        hospitalizationStayId: null,
        isInHouse: true,
        status: 'Pendiente',
        createdAt: '2026-09-25T14:35:00Z',
        items: [
          {
            id: 'item-2',
            procedureOrderId: 'proc-ord-new',
            procedureId: 'proc-456',
            procedureName: 'Ecografía Abdominal',
            notes: 'Vejiga llena',
          },
        ],
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const payload: CreateProcedureOrderInput = {
    clientPetId: 'cp-1',
    appointmentId: 'apt-1',
    hospitalizationStayId: null,
    isInHouse: true,
    referredTo: null,
    referralReason: null,
    items: [
      {
        procedureId: 'proc-456',
        notes: 'Vejiga llena',
      },
    ],
  }

  const result = await createProcedureOrder(payload)

  assert.equal(recordedCalls.length, 1)
  assert.match(recordedCalls[0].url, /\/api\/procedure-orders$/)
  assert.equal(recordedCalls[0].method, 'POST')
  assert.deepEqual(recordedCalls[0].body, payload)
  assert.equal(result.id, 'proc-ord-new')
})

test('la expedición de orden no guarda la atención médica ni actualiza la cita a ATENDIDA', async () => {
  const endpointsCalled: string[] = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    endpointsCalled.push(`${init?.method || 'GET'} ${url}`)

    return new Response(
      JSON.stringify({
        id: 'med-ord-1',
        clientPetId: 'cp-1',
        veterinarianId: 'vet-100',
        appointmentId: 'apt-1',
        status: 'Pendiente',
        createdAt: '2026-09-25T14:30:00Z',
        items: [],
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Simular creación de orden
  await createMedicationOrder({
    clientPetId: 'cp-1',
    appointmentId: 'apt-1',
    isInHouse: true,
    items: [{ medicationId: 'med-1', notes: '1 tab' }],
  })

  // Verificar que NO se llamaron endpoints de guardado de consulta médica ni transición de cita
  assert.ok(!endpointsCalled.some((e) => e.includes('/api/medical-records')))
  assert.ok(!endpointsCalled.some((e) => e.includes('/api/Appointments/apt-1/status')))
})

test('después de expedir una orden, la recarga de órdenes obtiene la lista actualizada', async () => {
  const initialMeds: ApiMedicationOrder[] = []
  const updatedMeds: ApiMedicationOrder[] = [
    {
      id: 'med-ord-created',
      clientPetId: 'cp-1',
      veterinarianId: 'vet-100',
      appointmentId: 'apt-1',
      isInHouse: true,
      status: 'Pendiente',
      createdAt: '2026-09-25T14:40:00Z',
      items: [
        {
          id: 'item-1',
          medicationOrderId: 'med-ord-created',
          medicationId: 'med-1',
          medicationName: 'Amoxicilina',
        },
      ],
    },
  ]

  let isCreated = false

  globalThis.fetch = async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/medication-orders/appointment/apt-1')) {
      return new Response(JSON.stringify(isCreated ? updatedMeds : initialMeds), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (url.includes('/api/procedure-orders/appointment/apt-1')) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response('{}', { status: 200 })
  }

  // Carga inicial
  const beforeOrders = await fetchMedicationOrdersByAppointment('apt-1')
  assert.equal(beforeOrders.length, 0)

  // Expedición y recarga posterior
  isCreated = true
  const afterOrders = await fetchMedicationOrdersByAppointment('apt-1')
  assert.equal(afterOrders.length, 1)
  assert.equal(afterOrders[0].id, 'med-ord-created')
})

test('simular errores 400, 403 y 409 al crear orden propaga el mensaje real del backend', async () => {
  // 1. Error 400 Bad Request
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: 'El medicamento seleccionado no tiene stock disponible.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })

  await assert.rejects(
    async () => {
      await createMedicationOrder({
        clientPetId: 'cp-1',
        appointmentId: 'apt-1',
        isInHouse: true,
        items: [{ medicationId: 'med-bad' }],
      })
    },
    (err: Error) => {
      assert.match(err.message, /El medicamento seleccionado no tiene stock disponible/i)
      return true
    },
  )

  // 2. Error 403 Forbidden
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: 'Solo un veterinario autorizado puede expedir órdenes médicas.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })

  await assert.rejects(
    async () => {
      await createProcedureOrder({
        clientPetId: 'cp-1',
        appointmentId: 'apt-1',
        isInHouse: true,
        items: [{ procedureId: 'proc-bad' }],
      })
    },
    (err: Error) => {
      assert.match(err.message, /Solo un veterinario autorizado/i)
      return true
    },
  )

  // 3. Error 409 Conflict
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: 'La atención ya fue cerrada previamente.' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    })

  await assert.rejects(
    async () => {
      await createMedicationOrder({
        clientPetId: 'cp-1',
        appointmentId: 'apt-1',
        isInHouse: true,
        items: [{ medicationId: 'med-1' }],
      })
    },
    (err: Error) => {
      assert.match(err.message, /La atención ya fue cerrada/i)
      return true
    },
  )
})

test('simular error al cargar catálogos propaga el error para permitir reintento en UI', async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: 'Error interno en el servidor al consultar medicamentos.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })

  await assert.rejects(
    async () => {
      await fetchMedications(true)
    },
    (err: Error) => {
      assert.match(err.message, /Error interno en el servidor/i)
      return true
    },
  )

  await assert.rejects(
    async () => {
      await fetchProcedures(true)
    },
    (err: Error) => {
      assert.match(err.message, /Error interno en el servidor/i)
      return true
    },
  )
})

test('flujo de múltiples órdenes consecutivas conserva el estado de atención y permite encadenar órdenes', async () => {
  const createdOrders: string[] = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/medication-orders') && init?.method === 'POST') {
      const id = `med-${createdOrders.length + 1}`
      createdOrders.push(id)
      return new Response(
        JSON.stringify({
          id,
          clientPetId: 'cp-1',
          appointmentId: 'apt-1',
          isInHouse: true,
          status: 'Pendiente',
          createdAt: new Date().toISOString(),
          items: [],
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      )
    }
    if (url.includes('/api/procedure-orders') && init?.method === 'POST') {
      const id = `proc-${createdOrders.length + 1}`
      createdOrders.push(id)
      return new Response(
        JSON.stringify({
          id,
          clientPetId: 'cp-1',
          appointmentId: 'apt-1',
          isInHouse: true,
          status: 'Pendiente',
          createdAt: new Date().toISOString(),
          items: [],
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      )
    }
    return new Response('[]', { status: 200 })
  }

  // 1. Crear primera orden (Medicamento)
  const ord1 = await createMedicationOrder({
    clientPetId: 'cp-1',
    appointmentId: 'apt-1',
    isInHouse: true,
    items: [{ medicationId: 'm1' }],
  })
  assert.equal(ord1.id, 'med-1')

  // 2. Crear segunda orden consecutiva (Procedimiento)
  const ord2 = await createProcedureOrder({
    clientPetId: 'cp-1',
    appointmentId: 'apt-1',
    isInHouse: true,
    items: [{ procedureId: 'p1' }],
  })
  assert.equal(ord2.id, 'proc-2')

  // Ambas órdenes se crearon en la misma cita
  assert.equal(createdOrders.length, 2)
})
