/**
 * Provider-agnostic action tools for the chat agent.
 *
 * The widget's "tool use" contract: the model answers with a JSON object
 * (`{"action": "<name>", "params": {...}}`) naming one of the profile's
 * `Action`s; this module owns everything after that — parsing the request,
 * executing the action (localStorage or HTTP), and formatting the result
 * for display. It knows nothing about which AI provider produced the JSON,
 * so OpenAI/Gemini/Ollama all share it, and a provider with native
 * function-calling can map `toToolSpec()` onto it later.
 */

import { Action } from '../../../shared/types';

export interface AgentActionRequest {
  action?: string;
  navigate?: string;
  params?: Record<string, any>;
}

/** Extract the first JSON object from a model reply, or null. */
export function parseAgentAction(reply: string): AgentActionRequest | null {
  const match = reply.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    return obj && typeof obj === 'object' ? obj : null;
  } catch {
    return null;
  }
}

/** Case-insensitive action lookup by name. */
export function findAction(actions: Action[] | undefined, name: string): Action | undefined {
  const needle = name.toLowerCase();
  return actions?.find((a) => a.name.toLowerCase() === needle);
}

/** True when the user's message explicitly asks for an action — the guard
 *  that stops the model's JSON habit from hijacking normal conversation. */
export function isExplicitActionRequest(userText: string): boolean {
  return /\b(search|find|lookup|add to cart|remove from cart|view cart|checkout|create order|confirm order)\b/i
    .test(userText.toLowerCase());
}

/**
 * Execute an action: `source: 'local'`/`localKey` reads localStorage,
 * otherwise HTTP against `baseUrl + endpoint` (GET query-string or JSON
 * body per `method`). Returns the parsed response.
 */
export async function executeAction(
  action: Action,
  params: Record<string, any> | undefined,
  baseUrl: string,
): Promise<any> {
  if (action.source === 'local' || action.localKey) {
    const localKey = action.localKey || action.name.toLowerCase().replace(/\s+/g, '_');
    const raw = localStorage.getItem(localKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  const base = (baseUrl || '').replace(/\/$/, '');
  const endpoint = action.endpoint || '';
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;

  const method = (action.method || 'GET').toUpperCase();
  let fetchUrl = url;
  const fetchOptions: RequestInit = { method };

  if (method === 'GET') {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params || {})) qs.set(k, String(v));
    const query = qs.toString();
    fetchUrl = query ? `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}${query}` : fetchUrl;
  } else {
    fetchOptions.headers = { 'Content-Type': 'application/json' };
    fetchOptions.body = JSON.stringify(params || {});
  }

  const res = await fetch(fetchUrl, fetchOptions);
  const ctype = res.headers.get('content-type') || '';
  return ctype.includes('application/json') ? res.json() : res.text();
}

/**
 * Format an action result for chat display — the same presentation the
 * widget used inline: array previews, short key-value objects, raw text.
 */
export function formatActionResult(data: any): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return 'No results found.';
    const preview = data.slice(0, 5).map((it: any, i: number) => {
      const name = it.title || it.name || it.id || 'item';
      const price = it.price ? ` - ${it.price}` : '';
      return `${i + 1}. ${name}${price}`;
    }).join('\n');
    const suffix = data.length > 5 ? `\n...and ${data.length - 5} more` : '';
    return `${preview}${suffix}`;
  }
  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data).filter(([k]) => !k.startsWith('_') && k !== 'id');
    if (entries.length <= 3) {
      return entries
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join('\n');
    }
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}

/**
 * OpenAI-compatible function spec for an action — the seam for providers
 * with native tool calling (the JSON-in-text contract remains the default
 * because it works identically across all three providers).
 */
export function toToolSpec(action: Action) {
  const properties: Record<string, any> = {};
  for (const [key, desc] of Object.entries(action.params || {})) {
    properties[key] = { type: 'string', description: String(desc) };
  }
  return {
    type: 'function' as const,
    function: {
      name: action.name.toLowerCase().replace(/\s+/g, '_'),
      description: action.description || action.name,
      parameters: { type: 'object', properties },
    },
  };
}
