import React, { useEffect, useMemo, useState } from 'react';

const AUTH_KEY = 'ai_agent_owner_auth';
const SSN_KEY = 'ai_owner_authed_session_v1';

function buf2hex(buffer: ArrayBuffer) {
  const byteArray = new Uint8Array(buffer);
  const hexCodes: string[] = [];
  for (let i = 0; i < byteArray.length; i++) {
    const hex = byteArray[i].toString(16).padStart(2, '0');
    hexCodes.push(hex);
  }
  return hexCodes.join('');
}

async function sha256(text: string) {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return buf2hex(digest);
}

function readAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeAuth(v: any) {
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(v)); } catch {}
}

const GateScreen: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-full max-w-sm bg-white border rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  </div>
);

const OwnerGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [err, setErr] = useState('');

  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    const existing = readAuth();

    // Origin check
    const currentOrigin = window.location.origin;
    const allowed: string[] = existing?.allowedOrigins || [];
    if (allowed.length > 0 && !allowed.includes(currentOrigin)) {
      setBlocked(`Admin disabled on this origin (${currentOrigin}).`);
      setReady(true);
      return;
    }

    // Optional adminKey check
    const storedKey: string | undefined = existing?.adminKey;
    if (storedKey) {
      const provided = params.get('adminKey') || (window as any).__ADMIN_BOOTSTRAP_KEY || '';
      if (provided !== storedKey) {
        setBlocked('Admin requires a valid adminKey.');
        setReady(true);
        return;
      }
    }

    // Session check
    const ssn = sessionStorage.getItem(SSN_KEY);
    if (ssn === '1') {
      setAuthed(true); setReady(true); return;
    }

    if (!existing) {
      setNeedsSetup(true); setReady(true); return;
    }

    setReady(true);
  }, [params]);

  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [originsList, setOriginsList] = useState<string[]>([]);
  const [newOrigin, setNewOrigin] = useState('');

  useEffect(() => {
    const existing = readAuth();
    if (existing) {
      setAdminKey(existing.adminKey || '');
      setOriginsList((existing.allowedOrigins || []));
    } else {
      setOriginsList([window.location.origin]);
    }
  }, []);

  const addOriginsFromString = (text: string) => {
    const parts = text.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    setOriginsList(prev => Array.from(new Set([...prev, ...parts])));
  };

  const removeOrigin = (idx: number) => {
    setOriginsList(prev => prev.filter((_, i) => i !== idx));
  };

  const onSetup = async () => {
    setErr('');
    if (!pin || pin.length < 6) { setErr('PIN must be at least 6 characters.'); return; }
    if (pin !== pin2) { setErr('PINs do not match.'); return; }
    const salt = Math.random().toString(36).slice(2, 10);
    const hash = await sha256(pin + salt);
    const allowedOrigins = originsList;
    writeAuth({ hash, salt, createdAt: new Date().toISOString(), allowedOrigins, adminKey: adminKey || undefined });
    sessionStorage.setItem(SSN_KEY, '1');
    setAuthed(true);
    setNeedsSetup(false);
  };

  const onLogin = async () => {
    setErr('');
    const existing = readAuth();
    if (!existing) { setNeedsSetup(true); return; }
    const hash = await sha256(pin + existing.salt);
    if (hash === existing.hash) {
      sessionStorage.setItem(SSN_KEY, '1');
      setAuthed(true);
    } else {
      setErr('Invalid PIN.');
    }
  };

  const onUpdateSecurity = async () => {
    const existing = readAuth() || {};
    const allowedOrigins = originsList;
    writeAuth({ ...existing, allowedOrigins, adminKey: adminKey || undefined });
  };

  if (!ready) return null;
  if (blocked) return (
    <GateScreen title="Admin Disabled">
      <p className="text-sm text-gray-600 mb-4">{blocked}</p>
      <p className="text-xs text-gray-500">Tip: set allowedOrigins and an optional adminKey during onboarding.</p>
    </GateScreen>
  );

  if (needsSetup) return (
    <GateScreen title="Owner Onboarding">
      <div className="space-y-3">
        <label className="block text-sm">Set Owner PIN</label>
        <input className="w-full border rounded px-3 py-2" type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter PIN" />
        <input className="w-full border rounded px-3 py-2" type="password" value={pin2} onChange={(e) => setPin2(e.target.value)} placeholder="Confirm PIN" />

        <label className="block text-sm mt-2">Allowed Origins</label>
        <div className="flex gap-2">
          <input className="flex-1 border rounded px-3 py-2 text-sm" value={newOrigin} onChange={(e) => setNewOrigin(e.target.value)} placeholder="Add origin (e.g. https://example.com)" />
          <button type="button" onClick={() => { addOriginsFromString(newOrigin); setNewOrigin(''); }} className="px-3 py-2 bg-gray-100 rounded">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {originsList.map((o, i) => (
            <div key={o + i} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded text-sm">
              <span className="text-xs">{o}</span>
              <button onClick={() => removeOrigin(i)} className="text-xs text-red-600">×</button>
            </div>
          ))}
        </div>

        <label className="block text-sm mt-2">Optional adminKey (query param)</label>
        <input className="w-full border rounded px-3 py-2" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Leave blank to disable" />
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button onClick={onSetup} className="w-full bg-blue-600 text-white px-4 py-2 rounded">Save & Enter Admin</button>
      </div>
    </GateScreen>
  );

  if (!authed) return (
    <GateScreen title="Owner Login">
      <div className="space-y-3">
        <input className="w-full border rounded px-3 py-2" type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter PIN" />
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button onClick={onLogin} className="w-full bg-blue-600 text-white px-4 py-2 rounded">Unlock</button>
        <div className="text-xs text-gray-500">Forgot PIN? Clear site data in your browser to reset.</div>
      </div>
    </GateScreen>
  );

  return (
    <div>
      <div className="bg-yellow-50 border-b border-yellow-200 text-xs text-yellow-900 px-4 py-2 flex items-center justify-between">
        <div>Owner Mode • Origin: {window.location.origin}</div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <input className="border rounded px-2 py-1 text-xs w-64" value={newOrigin} onChange={(e) => setNewOrigin(e.target.value)} placeholder="Add origin (e.g. https://example.com)" />
            <button type="button" onClick={() => { addOriginsFromString(newOrigin); setNewOrigin(''); }} className="border px-2 py-1 rounded text-xs">Add</button>
          </div>

          <div className="flex flex-wrap gap-2 max-w-xs">
            {originsList.map((o, i) => (
              <div key={o + i} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded text-xs">
                <span className="text-xs">{o}</span>
                <button onClick={() => removeOrigin(i)} className="text-xs text-red-600">×</button>
              </div>
            ))}
          </div>

          <input className="border rounded px-2 py-1 text-xs w-48" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="adminKey (optional)" />
          <button onClick={onUpdateSecurity} className="border px-2 py-1 rounded text-xs">Update</button>
        </div>
      </div>
      {children}
    </div>
  );
};

export default OwnerGate;
