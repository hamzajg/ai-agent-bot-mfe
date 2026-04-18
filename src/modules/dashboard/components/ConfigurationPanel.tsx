import React, { useEffect, useRef, useState } from 'react';
import { Action } from '@shared/types';
import { readJSON, writeJSON } from '@shared/utils/storage';

const LS_KEY = 'ai_agent_config';

type Config = {
  provider: 'openai' | 'gemini' | 'ollama';
  role: string;
  mission: string;
  responsibilities: string[];
  actions: Action[];
  assetsBaseUrl?: string;
  productDetailsUrlTemplate?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
  ollamaUrl?: string;
  ollamaModel?: string;
};

const defaultConfig: Config = {
  provider: 'openai',
  role: 'AI Shopping Assistant',
  mission: 'Help users browse products and answer store questions concisely.',
  responsibilities: [
    'Answer store/product questions',
    'Assist with shopping flows',
    'Keep responses short',
  ],
  actions: [
    {
      name: 'Products Search',
      description:
        'Search products by name or description. Provide short bullet results: description (price).',
      endpoint: '/assets/products.json',
      method: 'GET',
      params: { text: 'Search text such as name or description' },
    },
  ],
  assetsBaseUrl: '',
  productDetailsUrlTemplate: '/products/{id}',
  openaiApiKey: '',
  geminiApiKey: '',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama2',
};

function tryParseArray(raw: string): any[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

const ConfigurationPanel: React.FC = () => {
  const [cfg, setCfg] = useState<Config>(defaultConfig);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = readJSON(LS_KEY, defaultConfig);
    setCfg({ ...defaultConfig, ...stored });
  }, []);

  const setField = <K extends keyof Config>(key: K, value: Config[K]) =>
    setCfg((prev) => ({ ...prev, [key]: value }));

  const onSave = () => writeJSON(LS_KEY, cfg);
  const onLoad = () => setCfg({ ...defaultConfig, ...readJSON(LS_KEY, defaultConfig) });
  const onClear = () => localStorage.removeItem(LS_KEY);
  const onExport = () => {
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'agent-config.json'; a.click();
    URL.revokeObjectURL(url);
  };
  const onImportClick = () => importInputRef.current?.click();
  const onImportFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        setCfg({ ...defaultConfig, ...parsed });
      } catch {}
    };
    reader.readAsText(file);
  };

  const responsibilitiesText = JSON.stringify(cfg.responsibilities, null, 2);
  const actionsText = JSON.stringify(cfg.actions, null, 2);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Configuration</h2>
      <p className="text-sm text-gray-600 mb-4">Configure provider, agent context, actions and endpoints. Saved to localStorage and read by the embedded widget.</p>

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">AI Provider</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={cfg.provider}
            onChange={(e) => setField('provider', e.target.value as Config['provider'])}
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>

        {/* Provider-specific settings shown directly under provider select */}
        <div className="mt-3">
          {cfg.provider === 'openai' && (
            <div>
              <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="password"
                value={cfg.openaiApiKey || ''}
                onChange={(e) => setField('openaiApiKey', e.target.value)}
                placeholder="sk-..."
              />
            </div>
          )}

          {cfg.provider === 'gemini' && (
            <div>
              <label className="block text-sm font-medium mb-1">Gemini API Key</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="password"
                value={cfg.geminiApiKey || ''}
                onChange={(e) => setField('geminiApiKey', e.target.value)}
                placeholder="AIza..."
              />
            </div>
          )}

          {cfg.provider === 'ollama' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ollama Base URL</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={cfg.ollamaUrl || ''}
                  onChange={(e) => setField('ollamaUrl', e.target.value)}
                  placeholder="http://localhost:11434"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ollama Model</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={cfg.ollamaModel || ''}
                  onChange={(e) => setField('ollamaModel', e.target.value)}
                  placeholder="llama2"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Agent Role</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={cfg.role}
            onChange={(e) => setField('role', e.target.value)}
            placeholder="AI Shopping Assistant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Agent Mission</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={2}
            value={cfg.mission}
            onChange={(e) => setField('mission', e.target.value)}
            placeholder="Help users browse products and answer store questions concisely."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Responsibilities (JSON array of strings)</label>
          <textarea
            className="w-full border rounded px-3 py-2 font-mono text-sm"
            rows={4}
            value={responsibilitiesText}
            onChange={(e) => setField('responsibilities', tryParseArray(e.target.value) as string[])}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Actions (JSON array)</label>
          <textarea
            className="w-full border rounded px-3 py-2 font-mono text-sm"
            rows={8}
            value={actionsText}
            onChange={(e) => setField('actions', tryParseArray(e.target.value) as Action[])}
          />
          <p className="text-xs text-gray-500 mt-1">Each action: {'{'} name, description, endpoint, method: "GET"|"POST", params? {'}'}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Assets Base URL (optional)</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={cfg.assetsBaseUrl || ''}
              onChange={(e) => setField('assetsBaseUrl', e.target.value)}
              placeholder="http://localhost:8081"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product Details URL Template</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={cfg.productDetailsUrlTemplate || ''}
              onChange={(e) => setField('productDetailsUrlTemplate', e.target.value)}
              placeholder="/products/{id}"
            />
          </div>
        </div>

        

        <div className="flex gap-3 mt-2">
          <button onClick={onSave} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
          <button onClick={onLoad} className="border px-4 py-2 rounded">Load</button>
          <button onClick={onClear} className="border px-4 py-2 rounded">Clear</button>
          <button onClick={onExport} className="border px-4 py-2 rounded">Export</button>
          <input ref={importInputRef} onChange={onImportFile} type="file" accept="application/json" className="hidden" />
          <button onClick={onImportClick} className="border px-4 py-2 rounded">Import</button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
