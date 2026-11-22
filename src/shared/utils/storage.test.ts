import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  appendChatMessage,
  clearChatHistory,
  clearGuestProfile,
  getLocalStorageKeys,
  readChatHistory,
  readGuestProfile,
  readJSON,
  writeChatHistory,
  writeGuestProfile,
  writeJSON,
} from './storage'

const store = new Map<string, string>()

const localStorageStub = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => { store.set(key, value) },
  removeItem: (key: string) => { store.delete(key) },
  key: (index: number) => Array.from(store.keys())[index] ?? null,
  get length() { return store.size },
  clear: () => { store.clear() },
}

beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', localStorageStub)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('shared storage utils', () => {
  // Scenario: readJSON handles missing and invalid data
  it('readJSON handles missing and invalid data', () => {
    expect(readJSON('missing', { fallback: true })).toEqual({ fallback: true })

    store.set('bad', '{not json')
    expect(readJSON('bad', ['fallback'])).toEqual(['fallback'])

    store.set('ok', JSON.stringify({ a: 1 }))
    expect(readJSON('ok', {})).toEqual({ a: 1 })
  })

  // Scenario: chat history is capped and appended
  it('chat history is capped and appended', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1234567890)

    const messages = Array.from({ length: 55 }, (_, i) => ({ sender: 'user' as const, text: `m${i}` }))
    writeChatHistory(messages)
    const stored = readChatHistory()
    expect(stored).toHaveLength(50)
    expect(stored[0].text).toBe('m5')
    expect(stored[49].text).toBe('m54')

    appendChatMessage({ sender: 'bot', text: 'hello' })
    const afterAppend = readChatHistory()
    expect(afterAppend).toHaveLength(50)
    expect(afterAppend[49]).toMatchObject({ sender: 'bot', text: 'hello', timestamp: 1234567890 })
  })

  // Scenario: guest profile and chat history can be cleared
  it('guest profile and chat history can be cleared', () => {
    writeGuestProfile({ role: 'assistant', mission: 'help', responsibilities: ['search'] })
    writeChatHistory([{ sender: 'user', text: 'hi' }])
    expect(readGuestProfile()?.role).toBe('assistant')
    expect(readChatHistory()).toHaveLength(1)

    clearGuestProfile()
    clearChatHistory()
    expect(readGuestProfile()).toBeNull()
    expect(readChatHistory()).toEqual([])
  })

  // Scenario: local storage keys filter system entries
  it('local storage keys filter system entries', () => {
    store.set('ai_agent_config', '1')
    store.set('ai_agent_guest_profile', '1')
    store.set('__AGENT_CONFIG', '1')
    store.set('vite-ui-theme', 'dark')
    store.set('user_pref', 'x')
    store.set('my_data', 'y')

    expect(getLocalStorageKeys().sort()).toEqual(['my_data', 'user_pref'])
  })

  // Scenario: shared utils suite runs in CI
  it('shared utils suite runs in CI', () => {
    writeJSON('k', { ok: true })
    expect(readJSON('k', null)).toEqual({ ok: true })
  })
})
