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