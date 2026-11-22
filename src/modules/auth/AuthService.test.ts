import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import AuthService from './AuthService'

const USERS_KEY = 'shop_owners'
const AUTH_KEY = 'shop_owner_auth'

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('AuthService storage hardening', () => {
  // Scenario: register stores a hashed password
  it('register stores a hashed password', async () => {
    const user = await AuthService.register({
      email: 'owner@example.com',
      password: 'super-secret',
      shopName: 'Demo Shop',
    })

    expect(user.email).toBe('owner@example.com')
    const users = JSON.parse(store.get(USERS_KEY) || '{}')
    const record = users['owner@example.com']
    expect(record).toBeTruthy()
    expect(record.password).toBeUndefined()
    expect(record.passwordHash).toEqual(expect.any(String))
    expect(record.salt).toEqual(expect.any(String))
    expect(record.passwordHash).not.toBe('super-secret')
    expect(record.salt.length).toBeGreaterThan(0)
  })

  // Scenario: login succeeds with a hashed password
  it('login succeeds with a hashed password', async () => {
    await AuthService.register({
      email: 'owner@example.com',
      password: 'super-secret',
      shopName: 'Demo Shop',
    })
    store.delete(AUTH_KEY)

    const user = await AuthService.login({
      email: 'owner@example.com',
      password: 'super-secret',
    })

    expect(user.email).toBe('owner@example.com')
    const session = JSON.parse(store.get(AUTH_KEY) || '{}')
    expect(session.user.email).toBe('owner@example.com')
  })

  // Scenario: login rejects an invalid password
  it('login rejects an invalid password', async () => {
    await AuthService.register({
      email: 'owner@example.com',
      password: 'super-secret',
      shopName: 'Demo Shop',
    })

    await expect(AuthService.login({
      email: 'owner@example.com',
      password: 'wrong-password',
    })).rejects.toThrow('Invalid credentials')
  })

  // Scenario: legacy plaintext password is migrated on login
  it('legacy plaintext password is migrated on login', async () => {
    store.set(USERS_KEY, JSON.stringify({
      'owner@example.com': {
        id: 'u1',
        email: 'owner@example.com',
        shopName: 'Legacy Shop',
        password: 'legacy-pass',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    }))

    const user = await AuthService.login({
      email: 'owner@example.com',
      password: 'legacy-pass',
    })

    expect(user.email).toBe('owner@example.com')
    const users = JSON.parse(store.get(USERS_KEY) || '{}')
    const record = users['owner@example.com']
    expect(record.password).toBeUndefined()
    expect(record.passwordHash).toEqual(expect.any(String))
    expect(record.salt).toEqual(expect.any(String))
  })

  // Scenario: auth storage suite runs in CI
  it('auth storage suite runs in CI', async () => {
    await AuthService.register({
      email: 'ci@example.com',
      password: 'ci-secret',
      shopName: 'CI Shop',
    })
    const user = await AuthService.login({
      email: 'ci@example.com',
      password: 'ci-secret',
    })
    expect(user.shopName).toBe('CI Shop')
  })
})
