import { Product } from '../types';

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return v as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T) {
  try { 
    localStorage.setItem(key, JSON.stringify(value)); 
  } catch {}
}

const GUEST_PROFILE_KEY = 'ai_agent_guest_profile';

export interface RouteConfig {
  name: string;
  path: string;
  description?: string;
}

export interface ActionParam {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description?: string;
}

export interface ActionConfig {
  name: string;
  endpoint?: string;
  method?: 'GET' | 'POST';
  description?: string;
  params?: ActionParam[];
  source?: 'api' | 'local';
  localKey?: string;
}

export interface GuestProfile {
  role: string;
  mission: string;
  responsibilities: string[];
  baseUrl?: string;
  routes?: RouteConfig[];
  actions?: ActionConfig[];
}

export function readGuestProfile(): GuestProfile | null {
  return readJSON<GuestProfile | null>(GUEST_PROFILE_KEY, null);
}

export function writeGuestProfile(profile: GuestProfile) {
  writeJSON(GUEST_PROFILE_KEY, profile);
}

export function clearGuestProfile() {
  try {
    localStorage.removeItem(GUEST_PROFILE_KEY);
  } catch {}
}

const CHAT_HISTORY_KEY = 'ai_agent_chat_history';

export interface ChatMessage {
  sender: 'user' | 'bot';
  text?: string;
  products?: Product[];
  link?: string;
  linkLabel?: string;
  timestamp?: number;
}

export function readChatHistory(): ChatMessage[] {
  return readJSON<ChatMessage[]>(CHAT_HISTORY_KEY, []);
}

export function writeChatHistory(messages: ChatMessage[]) {
  try {
    const limited = messages.slice(-50);
    writeJSON(CHAT_HISTORY_KEY, limited);
  } catch {}
}

export function appendChatMessage(message: ChatMessage) {
  try {
    const history = readChatHistory();
    history.push({ ...message, timestamp: Date.now() });
    writeChatHistory(history);
  } catch {}
}

export function clearChatHistory() {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch {}
}

const SYSTEM_KEYS = ['ai_agent_config', 'ai_agent_guest_profile', '__AGENT_CONFIG'];

export function getLocalStorageKeys(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !SYSTEM_KEYS.includes(key) && !key.startsWith('vite-')) {
        keys.push(key);
      }
    }
    return keys;
  } catch {
    return [];
  }
}