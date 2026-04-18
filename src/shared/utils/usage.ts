import { UsageEvent, UsageEventType } from '../types';
import { readJSON, writeJSON } from './storage';

const LOG_KEY = 'ai_usage_log_v1';
const DAILY_KEY = 'ai_usage_daily_v1';
const SETTINGS_KEY = 'ai_usage_settings_v1';

export type DailyAgg = {
  messages: number;
  actions: number;
  clicks: number;
  errors: number;
  actionsByName: Record<string, number>;
  lastActivity?: number;
};

export type UsageSettings = {
  logMessageContent: boolean;
  logCap: number;
};

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getSettings(): UsageSettings {
  const s = readJSON<Partial<UsageSettings>>(SETTINGS_KEY, {});
  return {
    logMessageContent: Boolean(s.logMessageContent),
    logCap: typeof s.logCap === 'number' && s.logCap > 0 ? s.logCap : 1000,
  };
}

export function setSettings(patch: Partial<UsageSettings>) {
  const cur = getSettings();
  const next = { ...cur, ...patch };
  writeJSON(SETTINGS_KEY, next);
}

export function logEvent(type: UsageEventType, meta: Record<string, any> = {}) {
  const settings = getSettings();
  const now = Date.now();
  const ev: UsageEvent = { id: `${now}-${Math.random().toString(36).slice(2, 8)}`, t: now, type, meta };

  // Ring buffer logs
  const log = readJSON<UsageEvent[]>(LOG_KEY, []);
  log.push(ev);
  const cap = settings.logCap;
  const trimmed = log.length > cap ? log.slice(log.length - cap) : log;
  writeJSON(LOG_KEY, trimmed);

  // Daily aggregates
  const daily = readJSON<Record<string, DailyAgg>>(DAILY_KEY, {});
  const key = todayKey(new Date(now));
  const agg: DailyAgg = daily[key] || { messages: 0, actions: 0, clicks: 0, errors: 0, actionsByName: {} };
  if (type === 'message_sent') agg.messages += 1;
  if (type === 'action_called') {
    agg.actions += 1;
    const name = String(meta.name || 'unknown');
    agg.actionsByName[name] = (agg.actionsByName[name] || 0) + 1;
  }
  if (type === 'product_clicked') agg.clicks += 1;
  if (type === 'error') agg.errors += 1;
  agg.lastActivity = now;
  daily[key] = agg;
  writeJSON(DAILY_KEY, daily);
}

export function getLogs(limit = 100): UsageEvent[] {
  const log = readJSON<UsageEvent[]>(LOG_KEY, []);
  return log.slice(Math.max(0, log.length - limit));
}

export function clearUsage() {
  localStorage.removeItem(LOG_KEY);
  localStorage.removeItem(DAILY_KEY);
}

export function getUsageSummary(days = 7) {
  const daily = readJSON<Record<string, DailyAgg>>(DAILY_KEY, {});
  // Collect last N days keys
  const keys: string[] = [];
  const base = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    keys.push(todayKey(d));
  }
  const series = keys.map((k) => ({ key: k, ...(daily[k] || { messages: 0, actions: 0, clicks: 0, errors: 0, actionsByName: {}, lastActivity: undefined }) }));
  const totals = series.reduce(
    (acc, d) => {
      acc.messages += d.messages; acc.actions += d.actions; acc.clicks += d.clicks; acc.errors += d.errors;
      return acc;
    },
    { messages: 0, actions: 0, clicks: 0, errors: 0 }
  );
  const byAction: Record<string, number> = {};
  Object.values(daily).forEach((d) => {
    Object.entries(d.actionsByName || {}).forEach(([name, c]) => { byAction[name] = (byAction[name] || 0) + c; });
  });
  const lastActivity = Math.max(0, ...Object.values(daily).map((d) => d.lastActivity || 0));
  return { series, totals, byAction, lastActivity };
}