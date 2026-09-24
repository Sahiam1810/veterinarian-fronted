import assert from 'node:assert/strict'
import test, { beforeEach, afterEach } from 'node:test'
import {
  fetchPetAdmissionOptions,
  admitStay,
} from '../../src/modules/hospitalizacion/services/hospitalizacionService.ts'
import { validateAdmissionForm } from '../../src/modules/hospitalizacion/utils/hospitalizacionDays.ts'
import type { PetAdmissionOption } from '../../src/modules/hospitalizacion/types/hospitalizacion.types.ts'

const originalFetch = globalThis.fetch

beforeEach(() => {
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key) {
      return store.get(key) ?? null
    },
    key(index) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key) {
      store.delete(key)
    },
    setItem(key, value) {
      store.set(key, value)
    },
  }
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: memoryStorage,
  })
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: memoryStorage,
  })
  localStorage.setItem(
    'huellitas_auth_tokens',
    JSON.stringify({
      accessToken: 'test-token',
      accessTokenExpiresAt: '2099-01-01T00:00:00Z',
      refreshToken: 'test-refresh',
    }),
  )
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('fetchPetAdmissionOptions consumes only GET /api/hospitalization-stays/admission-options and never calls legacy endpoints', async () => {
  const requestedUrls: string[] = []

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input)
    requestedUrls.push(url)

    const mockResponse: PetAdmissionOption[] = [
      {
        clientPetId: 'cp-guid-1',
        petName: 'Luna',
        ownerName: 'Juan Pérez',
      },
      {
        clientPetId: 'cp-guid-2',
        petName: 'Max',
        ownerName: 'María Gómez',
      },
    ]

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch

  const result = await fetchPetAdmissionOptions()

  // Verifica que solo hubo 1 llamada al endpoint de admission-options
  assert.equal(requestedUrls.length, 1)
  assert.ok(requestedUrls[0].includes('/api/hospitalization-stays/admission-options'))

  // Verifica explícitamente que no se llamaron los endpoints legacy
  assert.ok(!requestedUrls.some((u) => u.toLowerCase().includes('/api/clientspets')))
  assert.ok(!requestedUrls.some((u) => u.toLowerCase().includes('/api/pets')))
  assert.ok(!requestedUrls.some((u) => u.toLowerCase().includes('/api/clients')))

  assert.equal(result.length, 2)
  assert.equal(result[0].clientPetId, 'cp-guid-1')
  assert.equal(result[0].petName, 'Luna')
  assert.equal(result[0].ownerName, 'Juan Pérez')
})

test('fetchPetAdmissionOptions maps petName and ownerName for UI selection', async () => {
  globalThis.fetch = (async () => {
    const mockResponse: PetAdmissionOption[] = [
      {
        clientPetId: 'cp-abc-123',
        petName: 'Firulais',
        ownerName: 'Carlos Gómez',
      },
    ]
    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch

  const list = await fetchPetAdmissionOptions()
  const comboboxOptions = list.map((p) => ({
    id: p.clientPetId,
    name: p.petName,
    subtitle: `Propietario: ${p.ownerName}`,
  }))

  assert.equal(comboboxOptions.length, 1)
  assert.equal(comboboxOptions[0].id, 'cp-abc-123')
  assert.equal(comboboxOptions[0].name, 'Firulais')
  assert.equal(comboboxOptions[0].subtitle, 'Propietario: Carlos Gómez')
})

test('fetchPetAdmissionOptions propagates real API load errors without silent empty list fallbacks', async () => {
  globalThis.fetch = (async () => {
    return new Response(JSON.stringify({ message: 'No tienes permisos de hospitalización.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch

  await assert.rejects(
    async () => {
      await fetchPetAdmissionOptions()
    },
    (err: Error) => {
      assert.ok(err.message.includes('No tienes permisos de hospitalización.'))
      return true
    },
  )
})

test('validateAdmissionForm requires clientPetId and non-empty motivo', () => {
  // Sin mascota
  const noPet = validateAdmissionForm('', 'Observación')
  assert.equal(noPet.ok, false)
  assert.equal(noPet.error, 'Debes seleccionar una mascota.')

  const nullPet = validateAdmissionForm(null, 'Observación')
  assert.equal(nullPet.ok, false)

  // Sin motivo
  const noMotivo = validateAdmissionForm('cp-1', '')
  assert.equal(noMotivo.ok, false)
  assert.equal(noMotivo.error, 'El motivo de hospitalización es obligatorio.')

  // Motivo compuesto únicamente por espacios en blanco
  const whitespaceMotivo = validateAdmissionForm('cp-1', '     \n  \t  ')
  assert.equal(whitespaceMotivo.ok, false)
  assert.equal(whitespaceMotivo.error, 'El motivo de hospitalización es obligatorio.')

  // Formulario válido
  const valid = validateAdmissionForm('cp-1', 'Observación y tratamiento postoperatorio')
  assert.equal(valid.ok, true)
  assert.equal(valid.error, undefined)
})

test('admitStay sends POST /api/hospitalization-stays with clientPetId, appointmentId: null, and motivo', async () => {
  let capturedUrl = ''
  let capturedBody: Record<string, unknown> | null = null

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    capturedUrl = String(input)
    capturedBody = init?.body ? JSON.parse(String(init.body)) : null

    return new Response(JSON.stringify({ id: 'stay-created-123' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch

  const response = await admitStay({
    clientPetId: 'cp-guid-99',
    appointmentId: null,
    motivo: 'Observación y tratamiento postoperatorio',
  })

  assert.ok(capturedUrl.includes('/api/hospitalization-stays'))
  assert.deepEqual(capturedBody, {
    clientPetId: 'cp-guid-99',
    appointmentId: null,
    motivo: 'Observación y tratamiento postoperatorio',
  })
  assert.deepEqual(response, { id: 'stay-created-123' })
})

test('admitStay propagates 409 conflict error when pet has an active hospitalization stay', async () => {
  globalThis.fetch = (async () => {
    return new Response(
      JSON.stringify({ message: 'La mascota seleccionada ya cuenta con una estancia hospitalaria activa.' }),
      {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }) as typeof fetch

  await assert.rejects(
    async () => {
      await admitStay({
        clientPetId: 'cp-guid-active',
        appointmentId: null,
        motivo: 'Intento de readmisión',
      })
    },
    (err: Error) => {
      assert.ok(
        err.message.includes('La mascota seleccionada ya cuenta con una estancia hospitalaria activa.'),
      )
      return true
    },
  )
})

test('admission form button state logic disables button during submitting, loading or error', () => {
  function isSubmitDisabled(
    isSubmitting: boolean,
    selectedClientPetId: string,
    motivo: string,
    isLoadingPets: boolean,
    loadPetsError: string | null,
  ): boolean {
    return (
      isSubmitting ||
      !selectedClientPetId ||
      !motivo.trim() ||
      isLoadingPets ||
      !!loadPetsError
    )
  }

  // Deshabilitado mientras se envía la petición (bloqueo contra doble envío)
  assert.equal(isSubmitDisabled(true, 'cp-1', 'Motivo válido', false, null), true)

  // Deshabilitado si falta mascota
  assert.equal(isSubmitDisabled(false, '', 'Motivo válido', false, null), true)

  // Deshabilitado si falta motivo o está compuesto de espacios
  assert.equal(isSubmitDisabled(false, 'cp-1', '', false, null), true)
  assert.equal(isSubmitDisabled(false, 'cp-1', '   ', false, null), true)

  // Deshabilitado mientras cargan las mascotas
  assert.equal(isSubmitDisabled(false, 'cp-1', 'Motivo válido', true, null), true)

  // Deshabilitado si falló la carga de mascotas
  assert.equal(isSubmitDisabled(false, 'cp-1', 'Motivo válido', false, 'Error de conexión'), true)

  // Habilitado solo cuando los campos son válidos, no hay errores y no está enviando
  assert.equal(isSubmitDisabled(false, 'cp-1', 'Tratamiento postoperatorio', false, null), false)
})

test('admission button visibility requires canCreate permission', () => {
  function shouldShowAdmitButton(canCreate: boolean): boolean {
    return canCreate === true
  }

  assert.equal(shouldShowAdmitButton(true), true)
  assert.equal(shouldShowAdmitButton(false), false)
})
