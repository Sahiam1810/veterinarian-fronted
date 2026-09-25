import assert from 'node:assert/strict'
import test, { beforeEach, afterEach } from 'node:test'

import {
  setStoredUser,
} from '../../src/modules/auth/services/authService.ts'
import {
  fetchMedicationOrdersByStay,
  fetchProcedureOrdersByStay,
  createMedicationOrder,
  createProcedureOrder,
  fetchPendingMedicationOrders,
  fetchPendingProcedureOrders,
  type ApiMedicationOrder,
  type ApiProcedureOrder,
  type CreateMedicationOrderInput,
  type CreateProcedureOrderInput,
} from '../../src/modules/veterinario/services/ordenesMedicasService.ts'
import {
  createVetPermissionHelpers,
} from '../../src/modules/veterinario/utils/vetModulePermissions.ts'
import type { MyPermissionsMap } from '../../src/modules/auth/services/myPermissionsService.ts'

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

  const memLocalStorage = createMemoryStorage(localStore)
  const memSessionStorage = createMemoryStorage(sessionStore)

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: memLocalStorage,
  })
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: memSessionStorage,
  })

  setStoredUser(
    {
      id: 'vet-1',
      name: 'Dr. Veterinario',
      email: 'vet@huellitas.com',
      role: 'veterinario',
      roleName: 'Veterinario',
      accessToken: 'test-token',
    },
    true,
  )
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('fetchMedicationOrdersByStay and fetchProcedureOrdersByStay target T1 hospitalization endpoints', async () => {
  const recordedCalls: { url: string; method?: string; body?: unknown }[] = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    recordedCalls.push({
      url,
      method: init?.method || 'GET',
      body: init?.body ? JSON.parse(init.body as string) : undefined,
    })

    if (url.includes('/api/medication-orders/hospitalization-stay/stay-123')) {
      const mockOrders: ApiMedicationOrder[] = [
        {
          id: 'med-ord-1',
          clientPetId: 'pet-1',
          veterinarianId: 'vet-1',
          hospitalizationStayId: 'stay-123',
          appointmentId: null,
          isInHouse: true,
          status: 'Pendiente',
          createdAt: '2026-09-25T10:00:00Z',
          items: [
            {
              id: 'item-1',
              medicationOrderId: 'med-ord-1',
              medicationId: 'med-1',
              medicationName: 'Amoxicilina 250mg',
              notes: '1 tableta cada 12h',
            },
          ],
        },
      ]
      return new Response(JSON.stringify(mockOrders), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (url.includes('/api/procedure-orders/hospitalization-stay/stay-123')) {
      const mockProcOrders: ApiProcedureOrder[] = [
        {
          id: 'proc-ord-1',
          clientPetId: 'pet-1',
          veterinarianId: 'vet-1',
          hospitalizationStayId: 'stay-123',
          appointmentId: null,
          isInHouse: true,
          status: 'Pendiente',
          createdAt: '2026-09-25T10:15:00Z',
          items: [
            {
              id: 'item-2',
              procedureOrderId: 'proc-ord-1',
              procedureId: 'proc-1',
              procedureName: 'Hemograma Completo',
              notes: 'Ayuno previo',
            },
          ],
        },
      ]
      return new Response(JSON.stringify(mockProcOrders), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const meds = await fetchMedicationOrdersByStay('stay-123')
  assert.equal(meds.length, 1)
  assert.equal(meds[0].id, 'med-ord-1')
  assert.equal(meds[0].hospitalizationStayId, 'stay-123')
  assert.equal(meds[0].appointmentId, null)

  const procs = await fetchProcedureOrdersByStay('stay-123')
  assert.equal(procs.length, 1)
  assert.equal(procs[0].id, 'proc-ord-1')
  assert.equal(procs[0].hospitalizationStayId, 'stay-123')
  assert.equal(procs[0].appointmentId, null)

  assert.ok(recordedCalls.some((c) => c.url.endsWith('/api/medication-orders/hospitalization-stay/stay-123')))
  assert.ok(recordedCalls.some((c) => c.url.endsWith('/api/procedure-orders/hospitalization-stay/stay-123')))
})

test('createMedicationOrder sends hospitalizationStayId and appointmentId: null for stay orders', async () => {
  let createdPayload: CreateMedicationOrderInput | null = null

  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
    createdPayload = JSON.parse(init?.body as string)
    return new Response(
      JSON.stringify({
        id: 'new-med-order',
        ...createdPayload,
        status: 'Pendiente',
        createdAt: '2026-09-25T10:30:00Z',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const input: CreateMedicationOrderInput = {
    clientPetId: 'pet-abc',
    hospitalizationStayId: 'stay-456',
    appointmentId: null,
    isInHouse: true,
    referredTo: null,
    referralReason: null,
    items: [
      {
        medicationId: 'med-99',
        notes: 'Dosis hospitalaria',
      },
    ],
  }

  const result = await createMedicationOrder(input)
  assert.equal(result.id, 'new-med-order')
  assert.ok(createdPayload)
  const medPayload = createdPayload as CreateMedicationOrderInput
  assert.equal(medPayload.hospitalizationStayId, 'stay-456')
  assert.equal(medPayload.appointmentId, null)
  assert.equal(medPayload.clientPetId, 'pet-abc')
  assert.equal(medPayload.items?.[0].medicationId, 'med-99')
})

test('createProcedureOrder sends hospitalizationStayId and appointmentId: null for stay orders', async () => {
  let createdPayload: CreateProcedureOrderInput | null = null

  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
    createdPayload = JSON.parse(init?.body as string)
    return new Response(
      JSON.stringify({
        id: 'new-proc-order',
        ...createdPayload,
        status: 'Pendiente',
        createdAt: '2026-09-25T10:35:00Z',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const input: CreateProcedureOrderInput = {
    clientPetId: 'pet-abc',
    hospitalizationStayId: 'stay-456',
    appointmentId: null,
    isInHouse: true,
    referredTo: null,
    referralReason: null,
    items: [
      {
        procedureId: 'proc-88',
        notes: 'Radiografía de tórax',
      },
    ],
  }

  const result = await createProcedureOrder(input)
  assert.equal(result.id, 'new-proc-order')
  assert.ok(createdPayload)
  const procPayload = createdPayload as CreateProcedureOrderInput
  assert.equal(procPayload.hospitalizationStayId, 'stay-456')
  assert.equal(procPayload.appointmentId, null)
  assert.equal(procPayload.clientPetId, 'pet-abc')
  assert.equal(procPayload.items?.[0].procedureId, 'proc-88')
})

test('fetchPendingMedicationOrders and fetchPendingProcedureOrders propagate errors without silent empty array fallback', async () => {
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/medication-orders/pending')) {
      return new Response(
        JSON.stringify({ message: 'Solo un veterinario puede consultar órdenes pendientes.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      )
    }
    if (url.includes('/api/procedure-orders/pending')) {
      return new Response(
        JSON.stringify({ message: 'Error interno del servidor en procedimientos.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }
    return new Response('Not found', { status: 404 })
  }

  await assert.rejects(
    async () => {
      await fetchPendingMedicationOrders()
    },
    (err: Error) => {
      assert.match(err.message, /Solo un veterinario puede consultar órdenes pendientes/)
      return true
    },
  )

  await assert.rejects(
    async () => {
      await fetchPendingProcedureOrders()
    },
    (err: Error) => {
      assert.match(err.message, /Error interno del servidor en procedimientos/)
      return true
    },
  )
})

test('createMedicationOrder propagates backend 403 error message when non-veterinarian attempts creation', async () => {
  globalThis.fetch = async () => {
    return new Response(
      JSON.stringify({ message: 'Solo un veterinario puede crear órdenes médicas.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    )
  }

  await assert.rejects(
    async () => {
      await createMedicationOrder({
        clientPetId: 'pet-1',
        hospitalizationStayId: 'stay-1',
        appointmentId: null,
        isInHouse: true,
        items: [{ medicationId: 'med-1', notes: 'test' }],
      })
    },
    (err: Error) => {
      assert.equal(err.message, 'Solo un veterinario puede crear órdenes médicas.')
      return true
    },
  )
})

test('createMedicationOrder propagates backend 409 error message when stay is already discharged', async () => {
  globalThis.fetch = async () => {
    return new Response(
      JSON.stringify({ message: 'No se pueden crear órdenes médicas en una estancia dada de alta.' }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    )
  }

  await assert.rejects(
    async () => {
      await createMedicationOrder({
        clientPetId: 'pet-1',
        hospitalizationStayId: 'stay-discharged',
        appointmentId: null,
        isInHouse: true,
        items: [{ medicationId: 'med-1', notes: 'test' }],
      })
    },
    (err: Error) => {
      assert.equal(err.message, 'No se pueden crear órdenes médicas en una estancia dada de alta.')
      return true
    },
  )
})

test('Hospitalization orders permission gating rules', () => {
  // 1. Veterinario con permisos completos de Órdenes Médicas
  const vetPermissions: MyPermissionsMap = {
    'Órdenes Médicas': {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    Hospitalización: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
  }

  const helpers = createVetPermissionHelpers(vetPermissions)
  assert.equal(helpers.canViewModule('ordenesMedicas'), true)
  assert.equal(helpers.canCreateModule('ordenesMedicas'), true)
  assert.equal(helpers.canEditModule('ordenesMedicas'), true)
  assert.equal(helpers.canDeleteModule('ordenesMedicas'), false)

  // 2. Auxiliar o Recepcionista con solo lectura o sin crear órdenes
  const auxiliarPermissions: MyPermissionsMap = {
    'Órdenes Médicas': {
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
    Hospitalización: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  }

  const auxHelpers = createVetPermissionHelpers(auxiliarPermissions)
  assert.equal(auxHelpers.canViewModule('ordenesMedicas'), true)
  assert.equal(auxHelpers.canCreateModule('ordenesMedicas'), false)
  assert.equal(auxHelpers.canEditModule('ordenesMedicas'), true)

  // 3. Usuario sin permisos de Órdenes Médicas
  const restrictedPermissions: MyPermissionsMap = {
    Hospitalización: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  }

  const restrictedHelpers = createVetPermissionHelpers(restrictedPermissions)
  assert.equal(restrictedHelpers.canViewModule('ordenesMedicas'), false)
  assert.equal(restrictedHelpers.canCreateModule('ordenesMedicas'), false)
  assert.equal(restrictedHelpers.canEditModule('ordenesMedicas'), false)
})
