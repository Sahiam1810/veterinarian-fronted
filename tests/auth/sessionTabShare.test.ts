import assert from 'node:assert/strict'
import test, { afterEach, beforeEach } from 'node:test'

import {
  clearStoredUser,
  getAccessToken,
  getStoredUser,
  setStoredUser,
} from '../../src/modules/auth/services/authService.ts'
import type { AuthUser } from '../../src/modules/auth/types/index.ts'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length(): number { return this.values.size }
  clear(): void { this.values.clear() }
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null }
  removeItem(key: string): void { this.values.delete(key) }
  setItem(key: string, value: string): void { this.values.set(key, value) }
}

class CookieJar {
  private readonly values = new Map<string, string>()

  get cookie(): string {
    return [...this.values.entries()].map(([name, value]) => `${name}=${value}`).join('; ')
  }

  set cookie(value: string) {
    const parts = value.split(';').map((part) => part.trim())
    const pair = parts[0] ?? ''
    const separator = pair.indexOf('=')
    const name = separator === -1 ? pair : pair.slice(0, separator)
    const cookieValue = separator === -1 ? '' : pair.slice(separator + 1)
    const maxAge = parts.find((part) => part.toLowerCase().startsWith('max-age='))
    if (maxAge && Number(maxAge.slice(8)) === 0) {
      this.values.delete(name)
      return
    }
    this.values.set(name, cookieValue)
  }

  clear(): void {
    this.values.clear()
  }
}

const sampleUser: AuthUser = {
  id: 'person-1',
  name: 'Samuel',
  email: 'vet@huellitas.test',
  role: 'veterinario',
  roleName: 'Veterinario',
  roleId: '11111111-1111-1111-1111-111111111111',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
}

const cookies = new CookieJar()
let sharedLocalStorage = new MemoryStorage()

function installDocument(): void {
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      get cookie() { return cookies.cookie },
      set cookie(value: string) { cookies.cookie = value },
    },
  })
}

function installStorages(local: MemoryStorage, session: MemoryStorage): void {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: local })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: session })
}

beforeEach(() => {
  sharedLocalStorage = new MemoryStorage()
  cookies.clear()
  installDocument()
  installStorages(sharedLocalStorage, new MemoryStorage())
})

afterEach(() => {
  cookies.clear()
})

test('sin Recordarme guarda en localStorage para compartir la sesión entre pestañas', () => {
  setStoredUser(sampleUser, false)

  assert.ok(localStorage.getItem('huellitas_auth_user'))
  assert.equal(sessionStorage.getItem('huellitas_auth_user'), null)
  assert.match(document.cookie, /huellitas_auth_session=1/)
})

test('una pestaña nueva con sessionStorage vacío sigue leyendo la sesión activa', () => {
  setStoredUser(sampleUser, false)
  // Simula otra pestaña: mismo localStorage y cookie, sessionStorage propio vacío.
  installStorages(sharedLocalStorage, new MemoryStorage())

  const stored = getStoredUser()
  assert.equal(stored?.email, sampleUser.email)
  assert.equal(getAccessToken(), sampleUser.accessToken)
})

test('sin Recordarme, al cerrar el navegador (sin cookie de sesión) se cierra la sesión', () => {
  setStoredUser(sampleUser, false)
  cookies.clear()
  installStorages(sharedLocalStorage, new MemoryStorage())

  assert.equal(getStoredUser(), null)
  assert.equal(localStorage.getItem('huellitas_auth_user'), null)
})

test('con Recordarme la sesión sobrevive a un reinicio del navegador', () => {
  setStoredUser(sampleUser, true)
  cookies.clear()
  installStorages(sharedLocalStorage, new MemoryStorage())

  const stored = getStoredUser()
  assert.equal(stored?.email, sampleUser.email)
})

test('migra una sesión vieja de sessionStorage hacia localStorage compartido', () => {
  sessionStorage.setItem('huellitas_auth_user', JSON.stringify(sampleUser))
  sessionStorage.setItem('huellitas_auth_tokens', JSON.stringify({
    accessToken: sampleUser.accessToken,
    accessTokenExpiresAt: '2026-09-04T18:00:00Z',
    refreshToken: sampleUser.refreshToken,
    refreshTokenExpiresAt: '2026-09-11T18:00:00Z',
  }))

  const stored = getStoredUser()
  assert.equal(stored?.email, sampleUser.email)
  assert.ok(localStorage.getItem('huellitas_auth_user'))
  assert.equal(sessionStorage.getItem('huellitas_auth_user'), null)

  installStorages(sharedLocalStorage, new MemoryStorage())
  assert.equal(getStoredUser()?.email, sampleUser.email)
})

test('clearStoredUser elimina bandera, tokens y cookie de sesión', () => {
  setStoredUser(sampleUser, false)
  clearStoredUser()

  assert.equal(getStoredUser(), null)
  assert.equal(localStorage.getItem('huellitas_auth_remember'), null)
  assert.doesNotMatch(document.cookie, /huellitas_auth_session=1/)
})
