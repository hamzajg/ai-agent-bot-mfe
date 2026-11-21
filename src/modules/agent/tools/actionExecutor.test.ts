import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Action } from '../../../shared/types'
import {
  executeAction,
  findAction,
  formatActionResult,
  isExplicitActionRequest,
  parseAgentAction,
  toToolSpec,
} from './actionExecutor'

const products: Action = {
  name: 'Products Search',
  description: 'Search products by name or description.',
  endpoint: '/assets/products.json',
  method: 'GET',
  params: { text: 'Search text such as name or description' },
}

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('actionExecutor tool path', () => {
  // Scenario: parse the first JSON action from a reply
  it('parse the first JSON action from a reply', () => {
    const reply = 'Here are your options: {"action":"Products Search","params":{"text":"red shoe"}}'
    expect(parseAgentAction(reply)).toEqual({
      action: 'Products Search',
      params: { text: 'red shoe' },
    })
  })

  // Scenario: ignore JSON without an explicit action request
  it('ignore JSON without an explicit action request', () => {
    expect(isExplicitActionRequest('So a JSON object looks like {"action":"Products Search"}.')).toBe(false)
    expect(isExplicitActionRequest('Can you search for a red shoe?')).toBe(true)
  })

  // Scenario: find a tool case-insensitively
  it('find a tool case-insensitively', () => {
    expect(findAction([products], 'products search')).toBe(products)
  })

  // Scenario: miss an unknown tool safely
  it('miss an unknown tool safely', () => {
    expect(() => findAction([products], 'Checkout')).not.toThrow()
    expect(findAction([products], 'Checkout')).toBeUndefined()
    expect(findAction(undefined, 'Products Search')).toBeUndefined()
  })

  // Scenario: execute an HTTP tool with query params
  it('execute an HTTP tool with query params', async () => {
    const body = [{ title: 'Red Shoe', price: '$42' }]
    const fetchMock = vi.fn(async () => ({
      headers: { get: (name: string) => (name === 'content-type' ? 'application/json' : null) },
      json: async () => body,
      text: async () => JSON.stringify(body),
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await executeAction(products, { text: 'red shoe' }, 'https://shop.example/')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://shop.example/assets/products.json?text=red+shoe',
      { method: 'GET' },
    )
    expect(result).toEqual(body)
  })

  // Scenario: execute a localStorage tool
  it('execute a localStorage tool', async () => {
    store.set('my_cart', JSON.stringify([{ id: 'sku-1', qty: 2 }]))
    const cart: Action = { name: 'View Cart', description: 'Show cart', source: 'local', localKey: 'my_cart' }

    expect(await executeAction(cart, undefined, '')).toEqual([{ id: 'sku-1', qty: 2 }])
  })

  // Scenario: format an array preview
  it('format an array preview', () => {
    const text = formatActionResult([
      { name: 'Red Shoe', price: '$42' },
      { name: 'Blue Hat', price: '$18' },
    ])
    expect(text).toContain('1. Red Shoe - $42')
    expect(text).toContain('2. Blue Hat - $18')

    const long = formatActionResult(Array.from({ length: 6 }, (_, i) => ({ name: `Item ${i + 1}` })))
    expect(long).toContain('...and 1 more')
  })

  // Scenario: format key-value results
  it('format key-value results', () => {
    expect(formatActionResult({ status: 'ok', total: 3 })).toBe('status: ok\ntotal: 3')
  })

  // Scenario: format raw text
  it('format raw text', () => {
    expect(formatActionResult('No products matched.')).toBe('No products matched.')
  })

  // Scenario: map a tool spec for provider-native calling
  it('map a tool spec for provider-native calling', () => {
    expect(toToolSpec(products)).toEqual({
      type: 'function',
      function: {
        name: 'products_search',
        description: 'Search products by name or description.',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Search text such as name or description' },
          },
        },
      },
    })
  })
})
