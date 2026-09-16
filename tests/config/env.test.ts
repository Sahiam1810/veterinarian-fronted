import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  API_BASE_URL,
  IS_DEV,
  NOTIFICATIONS_HUB_URL,
  resolveApiBaseUrl,
} from '../../src/config/index.ts'

test('API_BASE_URL sale del entorno y no termina en slash', () => {
  assert.ok(API_BASE_URL.length > 0)
  assert.equal(API_BASE_URL.endsWith('/'), false)
  assert.match(API_BASE_URL, /^https?:\/\//)
})

test('NOTIFICATIONS_HUB_URL cuelga de la misma API_BASE_URL', () => {
  assert.equal(NOTIFICATIONS_HUB_URL, `${API_BASE_URL}/hubs/notifications`)
})

test('IS_DEV es un boolean', () => {
  assert.equal(typeof IS_DEV, 'boolean')
})

test('env.ts no contiene un host de API hardcodeado', () => {
  const source = readFileSync(new URL('../../src/config/env.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /chatcampuslands/i)
  assert.doesNotMatch(source, /https:\/\/api\./i)
})

test('resolveApiBaseUrl falla si no hay VITE_API_URL', () => {
  assert.throws(() => resolveApiBaseUrl(undefined, undefined), /VITE_API_URL/)
})

test('resolveApiBaseUrl rechaza un valor que no es http(s)', () => {
  assert.throws(() => resolveApiBaseUrl('ftp://servidor.local'), /http/)
})

test('los scripts de test cargan .env y no .env.example', () => {
  const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
    scripts: Record<string, string>
  }
  const testScripts = Object.entries(pkg.scripts).filter(([name]) => name.startsWith('test'))
  for (const [name, command] of testScripts) {
    assert.match(command, /--env-file=\.env(?:\s|$)/, `${name} debe usar .env`)
    assert.doesNotMatch(command, /env-file=\.env\.example/, `${name} no debe usar .env.example`)
  }
})
