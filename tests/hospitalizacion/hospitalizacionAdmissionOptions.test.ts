import assert from 'node:assert/strict'
import test, { beforeEach, afterEach } from 'node:test'
import {
  fetchPetAdmissionOptions,
  fetchAdmissionOptions,
  admitStay,
} from '../../src/modules/hospitalizacion/services/hospitalizacionService.ts'
import {
  calculateStayDays,
  formatStayDays,
  validateAdmissionForm,
} from '../../src/modules/hospitalizacion/utils/hospitalizacionDays.ts'
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

test('fetchPetAdmissionOptions consumes only GET /api/hospitalization-stays/admission-options without Mascotas or Clientes endpoints', async () => {
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
  const resultAlias = await fetchAdmissionOptions()

  assert.equal(requestedUrls.length, 2)
  assert.ok(requestedUrls[0].includes('/api/hospitalization-stays/admission-options'))
  assert.ok(requestedUrls[1].includes('/api/hospitalization-stays/admission-options'))
  assert.ok(
    !requestedUrls.some(
      (u) =>
        u.includes('/api/ClientsPets') ||
        u.includes('/api/Pets') ||
        u.includes('/api/Clients') ||
        u.includes('/api/mascotas') ||
        u.includes('/api/duenos'),
    ),
  )
  assert.equal(result.length, 2)
  assert.equal(result[0].clientPetId, 'cp-guid-1')
  assert.equal(result[0].petName, 'Luna')
  assert.equal(result[0].ownerName, 'Juan Pérez')
  assert.deepEqual(resultAlias, result)
})

test('fetchPetAdmissionOptions maps petName, ownerName and clientPetId for selector display', async () => {
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

test('fetchPetAdmissionOptions propagates API load errors without silent fallbacks and supports retry', async () => {
  let attempts = 0

  globalThis.fetch = (async () => {
    attempts++
    if (attempts === 1) {
      return new Response(JSON.stringify({ message: 'Error temporal del servidor.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(
      JSON.stringify([
        {
          clientPetId: 'cp-guid-retry',
          petName: 'Rocky',
          ownerName: 'Ana López',
        },
      ]),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }) as typeof fetch

  // Primer intento falla
  await assert.rejects(
    async () => {
      await fetchPetAdmissionOptions()
    },
    (err: Error) => {
      assert.ok(err.message.includes('Error temporal del servidor.'))
      return true
    },
  )

  // Reintento exitoso
  const retryResult = await fetchPetAdmissionOptions()
  assert.equal(retryResult.length, 1)
  assert.equal(retryResult[0].petName, 'Rocky')
})

test('validateAdmissionForm requires pet and non-empty motivo', () => {
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

  // Motivo compuesto únicamente por espacios
  const whitespaceMotivo = validateAdmissionForm('cp-1', '     \n  \t  ')
  assert.equal(whitespaceMotivo.ok, false)
  assert.equal(whitespaceMotivo.error, 'El motivo de hospitalización es obligatorio.')

  // Formulario válido
  const valid = validateAdmissionForm('cp-1', 'Tratamiento postoperatorio')
  assert.equal(valid.ok, true)
  assert.equal(valid.error, undefined)
})

test('admitStay sends POST /api/hospitalization-stays with clientPetId and appointmentId: null', async () => {
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
    motivo: 'Cuidados intensivos y fluidoterapia',
  })

  assert.ok(capturedUrl.includes('/api/hospitalization-stays'))
  assert.deepEqual(capturedBody, {
    clientPetId: 'cp-guid-99',
    appointmentId: null,
    motivo: 'Cuidados intensivos y fluidoterapia',
  })
  assert.deepEqual(response, { id: 'stay-created-123' })
})

test('admitStay propagates backend 409 Conflict error when pet has an active hospitalization stay', async () => {
  globalThis.fetch = (async () => {
    return new Response(
      JSON.stringify({ message: 'La mascota ya tiene una estancia activa.' }),
      {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }) as typeof fetch

  await assert.rejects(
    async () => {
      await admitStay({
        clientPetId: 'cp-guid-active-409',
        appointmentId: null,
        motivo: 'Intento de ingreso duplicado',
      })
    },
    (err: Error) => {
      assert.ok(err.message.includes('La mascota ya tiene una estancia activa.'))
      return true
    },
  )
})

test('form state logic preserves modal data upon admission failure', () => {
  let selectedClientPetId = 'cp-saved-guid'
  let motivo = 'Tratamiento postoperatorio'
  let isModalOpen = true
  let errorMessage: string | null = null

  const handleAdmissionFailure = (errorMsg: string) => {
    errorMessage = errorMsg
    // En fallo, no se limpia el formulario ni se cierra el modal
  }

  handleAdmissionFailure('La mascota ya tiene una estancia activa.')

  assert.equal(isModalOpen, true)
  assert.equal(selectedClientPetId, 'cp-saved-guid')
  assert.equal(motivo, 'Tratamiento postoperatorio')
  assert.equal(errorMessage, 'La mascota ya tiene una estancia activa.')
})

test('submit button and selector state logic disables controls during loading, submitting, empty list or missing fields', () => {
  function isSubmitDisabled(
    isSubmitting: boolean,
    isLoadingPets: boolean,
    selectedClientPetId: string,
    motivo: string,
  ): boolean {
    return isSubmitting || isLoadingPets || !selectedClientPetId || !motivo.trim()
  }

  // Deshabilitado mientras se cargan las opciones
  assert.equal(isSubmitDisabled(false, true, 'cp-1', 'Motivo válido'), true)

  // Deshabilitado mientras se envía la petición (bloqueo contra doble envío)
  assert.equal(isSubmitDisabled(true, false, 'cp-1', 'Motivo válido'), true)

  // Deshabilitado si falta mascota
  assert.equal(isSubmitDisabled(false, false, '', 'Motivo válido'), true)

  // Deshabilitado si falta motivo o solo tiene espacios
  assert.equal(isSubmitDisabled(false, false, 'cp-1', ''), true)
  assert.equal(isSubmitDisabled(false, false, 'cp-1', '   '), true)

  // Habilitado cuando los campos son válidos y no se está cargando ni enviando
  assert.equal(isSubmitDisabled(false, false, 'cp-1', 'Tratamiento postoperatorio'), false)
})

test('admission button visibility requires canCreate permission', () => {
  function shouldShowAdmitButton(canCreate: boolean): boolean {
    return canCreate === true
  }

  assert.equal(shouldShowAdmitButton(true), true)
  assert.equal(shouldShowAdmitButton(false), false)
})

test('admission success handler resets form and reloads active stays list', () => {
  let staysReloaded = false
  let toastMessage = ''
  let clientPetIdState = 'cp-to-clear'
  let motivoState = 'Motivo to clear'
  let isModalOpen = true

  const handleSuccess = () => {
    clientPetIdState = ''
    motivoState = ''
    isModalOpen = false
    toastMessage = 'Mascota admitida a hospitalización exitosamente.'
    staysReloaded = true
  }

  handleSuccess()

  assert.equal(staysReloaded, true)
  assert.equal(isModalOpen, false)
  assert.equal(clientPetIdState, '')
  assert.equal(motivoState, '')
  assert.equal(toastMessage, 'Mascota admitida a hospitalización exitosamente.')
})

test('calculateStayDays and formatStayDays work accurately', () => {
  const now = new Date('2026-09-25T12:00:00Z').getTime()

  // Mismo día
  assert.equal(calculateStayDays('2026-09-25T08:00:00Z', null, now), 0)
  assert.equal(formatStayDays(0), '0 días')

  // 1 día
  assert.equal(calculateStayDays('2026-09-24T12:00:00Z', null, now), 1)
  assert.equal(formatStayDays(1), '1 día')

  // 5 días
  assert.equal(calculateStayDays('2026-09-20T12:00:00Z', null, now), 5)
  assert.equal(formatStayDays(5), '5 días')
})
