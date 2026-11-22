import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearUsage, getLogs, getSettings, getUsageSummary, logEvent, setSettings } from './usage'

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
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-22T12:00:00Z'))
  vi.spyOn(Math, 'random').mockReturnValue(0.123456789)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('shared usage utils', () => {
  // Scenario: usage settings use defaults and updates
  it('usage settings use defaults and updates', () => {
    expect(getSettings()).toEqual({ logMessageContent: false, logCap: 1000 })

    setSettings({ logMessageContent: true, logCap: 2 })
    expect(getSettings()).toEqual({ logMessageContent: true, logCap: 2 })

    setSettings({ logMessageContent: false })
    expect(getSettings()).toEqual({ logMessageContent: false, logCap: 2 })
  })

  // Scenario: logEvent records logs and daily aggregates
  it('logEvent records logs and daily aggregates', () => {
    setSettings({ logCap: 2 })

    logEvent('message_sent', { content: 'hi' })
    logEvent('action_called', { name: 'search' })
    logEvent('product_clicked', { id: 'p1' })
    logEvent('error', { message: 'boom' })

    const logs = getLogs(10)
    expect(logs).toHaveLength(2)
    expect(logs.map((l) => l.type)).toEqual(['product_clicked', 'error'])

    const summary = getUsageSummary(1)
    expect(summary.totals).toEqual({ messages: 1, actions: 1, clicks: 1, errors: 1 })
    expect(summary.byAction).toEqual({ search: 1 })
    expect(summary.series[0].key).toBe('2026-11-22')
  })

  // Scenario: usage summary aggregates recent days
  it('usage summary aggregates recent days', () => {
    store.set('ai_usage_daily_v1', JSON.stringify({
      '2026-11-21': { messages: 2, actions: 1, clicks: 0, errors: 0, actionsByName: { search: 1 }, lastActivity: 1 },
      '2026-11-22': { messages: 1, actions: 0, clicks: 3, errors: 1, actionsByName: {}, lastActivity: 2 },
    }))

    const summary = getUsageSummary(2)
    expect(summary.series).toHaveLength(2)
    expect(summary.series[0].key).toBe('2026-11-21')
    expect(summary.series[1].key).toBe('2026-11-22')
    expect(summary.totals).toEqual({ messages: 3, actions: 1, clicks: 3, errors: 1 })
    expect(summary.byAction).toEqual({ search: 1 })
    expect(summary.lastActivity).toBe(2)
  })

  // Scenario: shared utils suite runs in CI
  it('shared utils suite runs in CI', () => {
    logEvent('message_sent')
    expect(getLogs(1)).toHaveLength(1)
    clearUsage()
    expect(getLogs(10)).toEqual([])
  })
})
