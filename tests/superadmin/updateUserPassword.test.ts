import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import {
  resetUserPassword,
  updateUser,
} from '../../src/modules/superadmin/services/superAdminUserService.ts'
import { changeMyPassword } from '../../src/modules/superadmin/services/superAdminProfileService.ts'
import { extractUserApiErrorMessage } from '../../src/modules/superadmin/utils/translateUserApiError.ts'
import type { UserFormData, UserSaveResult } from '../../src/modules/superadmin/types/userSuperAdmin.types.ts'

const originalFetch = globalThis.fetch

beforeEach(() => {
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() { return store.size },
    clear() { store.clear() },
    getItem(key) { return store.get(key) ?? null },
    key(index) { return [...store.keys()][index] ?? null },
    removeItem(key) { store.delete(key) },
    setItem(key, value) { store.set(key, value) },
  }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memoryStorage })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: memoryStorage })
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

test('resetUserPassword llama a PATCH /api/Users/{id}/password con newPassword', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/Users/user-edward-1/password') && init?.method === 'PATCH') {
      return new Response(null, { status: 204 })
    }
    return new Response('Not found', { status: 404 })
  }

  await resetUserPassword('user-edward-1', {
    newPassword: 'NuevaPassword2026!',
  })

  const patchPasswordCall = calls.find(
    (c) => c.url.includes('/api/Users/user-edward-1/password') && c.method === 'PATCH',
  )
  assert.ok(patchPasswordCall, 'debió llamar a PATCH /api/Users/user-edward-1/password')
  assert.equal(patchPasswordCall!.body.newPassword, 'NuevaPassword2026!')
})

test('editar usuario con nueva contraseña llama a PUT /api/Users/{id} y a PATCH /api/Users/{id}/password', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/Users/user-edward-1/password') && init?.method === 'PATCH') {
      return new Response(null, { status: 204 })
    }
    if (urlStr.includes('/api/Users/user-edward-1') && init?.method === 'PUT') {
      return new Response(null, { status: 204 })
    }
    return new Response('Not found', { status: 404 })
  }

  // Simulación del flujo ejecutado en useUserSuperAdmin.updateUser
  const executeUpdateUserFlow = async (
    userId: string,
    data: UserFormData,
  ): Promise<UserSaveResult> => {
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim()
      const email = data.email.trim()

      await updateUser(userId, {
        fullName,
        email,
        roleId: data.roleId,
      })

      const trimmedPassword = data.password?.trim()
      if (trimmedPassword) {
        await resetUserPassword(userId, {
          newPassword: trimmedPassword,
        })
      }

      return { ok: true, email, mode: 'edit' }
    } catch (err) {
      return { ok: false, error: extractUserApiErrorMessage(err) }
    }
  }

  const result = await executeUpdateUserFlow('user-edward-1', {
    firstName: 'Edward',
    lastName: 'Nutricionista',
    email: 'edward@huellitas.com',
    password: 'NuevaPassword2026!',
    roleId: 'role-nutri-1',
    status: 'Activo',
  })

  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.email, 'edward@huellitas.com')
    assert.equal(result.mode, 'edit')
  }

  const putUserCall = calls.find(
    (c) => c.url.includes('/api/Users/user-edward-1') && c.method === 'PUT',
  )
  assert.ok(putUserCall, 'debió llamar a PUT /api/Users/user-edward-1')
  assert.equal(putUserCall!.body.fullName, 'Edward Nutricionista')

  const patchPasswordCall = calls.find(
    (c) => c.url.includes('/api/Users/user-edward-1/password') && c.method === 'PATCH',
  )
  assert.ok(patchPasswordCall, 'debió llamar a PATCH /api/Users/user-edward-1/password')
  assert.equal(patchPasswordCall!.body.newPassword, 'NuevaPassword2026!')
})

test('editar usuario sin contraseña (vacío o espacios) conserva contraseña actual y no llama a PATCH /password', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/Users/user-edward-1') && init?.method === 'PUT') {
      return new Response(null, { status: 204 })
    }
    return new Response('Not found', { status: 404 })
  }

  const executeUpdateUserFlow = async (
    userId: string,
    data: UserFormData,
  ): Promise<UserSaveResult> => {
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim()
      const email = data.email.trim()

      await updateUser(userId, {
        fullName,
        email,
        roleId: data.roleId,
      })

      const trimmedPassword = data.password?.trim()
      if (trimmedPassword) {
        await resetUserPassword(userId, {
          newPassword: trimmedPassword,
        })
      }

      return { ok: true, email, mode: 'edit' }
    } catch (err) {
      return { ok: false, error: extractUserApiErrorMessage(err) }
    }
  }

  // Caso 1: password undefined
  const result1 = await executeUpdateUserFlow('user-edward-1', {
    firstName: 'Edward',
    lastName: 'Nutricionista',
    email: 'edward@huellitas.com',
    password: undefined,
    roleId: 'role-nutri-1',
    status: 'Activo',
  })
  assert.equal(result1.ok, true)

  // Caso 2: password vacío o solo espacios
  const result2 = await executeUpdateUserFlow('user-edward-1', {
    firstName: 'Edward',
    lastName: 'Nutricionista',
    email: 'edward@huellitas.com',
    password: '    ',
    roleId: 'role-nutri-1',
    status: 'Activo',
  })
  assert.equal(result2.ok, true)

  const passwordCalls = calls.filter((c) => c.url.includes('/password'))
  assert.equal(passwordCalls.length, 0, 'no debió llamar a PATCH /password cuando el campo está vacío')
})

test('si PATCH /password falla, el formulario captura y reporta el error', async () => {
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)

    if (urlStr.includes('/api/Users/user-edward-1/password') && init?.method === 'PATCH') {
      return Response.json(
        {
          title: 'Validation failed',
          status: 400,
          errors: {
            NewPassword: ['La nueva contraseña debe tener al menos 8 caracteres.'],
          },
        },
        { status: 400 },
      )
    }
    if (urlStr.includes('/api/Users/user-edward-1') && init?.method === 'PUT') {
      return new Response(null, { status: 204 })
    }
    return new Response('Not found', { status: 404 })
  }

  const executeUpdateUserFlow = async (
    userId: string,
    data: UserFormData,
  ): Promise<UserSaveResult> => {
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim()
      const email = data.email.trim()

      await updateUser(userId, {
        fullName,
        email,
        roleId: data.roleId,
      })

      const trimmedPassword = data.password?.trim()
      if (trimmedPassword) {
        await resetUserPassword(userId, {
          newPassword: trimmedPassword,
        })
      }

      return { ok: true, email, mode: 'edit' }
    } catch (err) {
      return { ok: false, error: extractUserApiErrorMessage(err) }
    }
  }

  const result = await executeUpdateUserFlow('user-edward-1', {
    firstName: 'Edward',
    lastName: 'Nutricionista',
    email: 'edward@huellitas.com',
    password: 'short',
    roleId: 'role-nutri-1',
    status: 'Activo',
  })

  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.match(result.error, /contraseña|8 caracteres/i)
  }
})

test('cambio de contraseña propia (SuperAdmin) continúa usando PATCH /api/auth/me/password', async () => {
  const calls: Array<{ url: string; method?: string; body?: any }> = []

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(input)
    const bodyParsed = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ url: urlStr, method: init?.method, body: bodyParsed })

    if (urlStr.includes('/api/auth/me/password') && init?.method === 'PATCH') {
      return new Response(null, { status: 204 })
    }
    return new Response('Not found', { status: 404 })
  }

  await changeMyPassword({
    currentPassword: 'OldPassword2026!',
    newPassword: 'NewSelfPassword2026!',
  })

  const selfPasswordCall = calls.find(
    (c) => c.url.includes('/api/auth/me/password') && c.method === 'PATCH',
  )
  assert.ok(selfPasswordCall, 'debió llamar a PATCH /api/auth/me/password')
  assert.equal(selfPasswordCall!.body.currentPassword, 'OldPassword2026!')
  assert.equal(selfPasswordCall!.body.newPassword, 'NewSelfPassword2026!')

  // Nunca debe llamar a /api/Users/{id}/password en autoservicio
  const superAdminUserCalls = calls.filter((c) => c.url.includes('/api/Users'))
  assert.equal(superAdminUserCalls.length, 0)
})
