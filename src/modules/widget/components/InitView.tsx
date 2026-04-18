import React, { useState, useEffect } from 'react';
import { User, Globe, X, Save, Plus, Trash2, ChevronDown, ChevronRight, Link, ExternalLink, Cog, Database } from 'lucide-react';
import { readGuestProfile, writeGuestProfile, GuestProfile, RouteConfig, ActionConfig, getLocalStorageKeys } from '@shared/utils/storage';

interface InitViewProps {
  onComplete: () => void;
  defaultProfile?: GuestProfile | null;
}

const defaultGuestProfile: GuestProfile = {
  role: 'AI Assistant',
  mission: 'Help users navigate and interact with this application.',
  responsibilities: [
    'Help users find and view products.',
    'Assist with navigation to different pages.',
    'When user wants to view product details, use the product details route.',
    'Never invent URLs; use configured routes only.',
  ],
  baseUrl: '',
  routes: [
    { name: 'Home', path: '/', description: 'Main landing page' },
    { name: 'Products', path: '/products', description: 'Product listing page' },
    { name: 'Product Details', path: '/products/{id}', description: 'Individual product page' },
    { name: 'Cart', path: '/cart', description: 'Shopping cart' },
    { name: 'Checkout', path: '/checkout', description: 'Checkout page' },
  ],
  actions: [],
};

const InitView: React.FC<InitViewProps> = ({ onComplete, defaultProfile }) => {
  const hasWebAppConfig = typeof window !== 'undefined' && !!(window as any).__AGENT_CONFIG?.role;
  const [mode, setMode] = useState<'choose' | 'guest'>('choose');

  const handleUseWebApp = () => {
    const cfg = (window as any).__AGENT_CONFIG;
    if (cfg && cfg.role) {
      const webProfile: GuestProfile = {
        role: cfg.role,
        mission: cfg.mission || '',
        responsibilities: cfg.responsibilities || [],
        baseUrl: cfg.assetsBaseUrl || cfg.baseUrl,
        routes: cfg.routes,
        actions: cfg.actions,
      };
      writeGuestProfile(webProfile);
      onComplete();
    } else {
      window.open('https://ai-agent-chatbot-58638.web.app/', '_blank');
    }
  };

  const handleGuestSetup = () => {
    setMode('guest');
  };

  const handleSaveGuest = (profile: GuestProfile) => {
    writeGuestProfile(profile);
    onComplete();
  };

  const getProfile = () => {
    const gp = readGuestProfile();
    return gp && gp.role ? gp : defaultGuestProfile;
  };

  if (mode === 'guest') {
    return <GuestProfileForm defaultProfile={getProfile()} onSave={handleSaveGuest} onCancel={() => setMode('choose')} />;
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-white">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome!</h3>
        <p className="text-sm text-gray-600">How would you like to set up your AI Agent?</p>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={handleUseWebApp}
          className="w-full flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Globe className="w-8 h-8 text-blue-600 mr-4" />
          <div className="text-left">
            <div className="font-medium text-gray-800">Use Web App Config</div>
            <div className="text-xs text-gray-500">Load agent profile from the web application</div>
          </div>
        </button>

        <button
          onClick={handleGuestSetup}
          className="w-full flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
        >
          <User className="w-8 h-8 text-green-600 mr-4" />
          <div className="text-left">
            <div className="font-medium text-gray-800">Guest Mode</div>
            <div className="text-xs text-gray-500">Set up a local profile yourself</div>
          </div>
        </button>
      </div>
    </div>
  );
};

interface GuestProfileFormProps {
  defaultProfile: GuestProfile;
  onSave: (profile: GuestProfile) => void;
  onCancel: () => void;
}

type ConfigSection = 'basic' | 'routes' | 'actions';

const GuestProfileForm: React.FC<GuestProfileFormProps> = ({ defaultProfile, onSave, onCancel }) => {
  const [activeSection, setActiveSection] = useState<ConfigSection>('basic');
  const [role, setRole] = useState(defaultProfile.role);
  const [mission, setMission] = useState(defaultProfile.mission);
  const [responsibilities, setResponsibilities] = useState(defaultProfile.responsibilities.join('\n'));
  const [baseUrl, setBaseUrl] = useState(defaultProfile.baseUrl || '');
  const [routes, setRoutes] = useState<RouteConfig[]>(defaultProfile.routes || []);
  const [actions, setActions] = useState<ActionConfig[]>([]);
  const [availableLocalKeys, setAvailableLocalKeys] = useState<string[]>([]);
  const [selectedLocalKeys, setSelectedLocalKeys] = useState<Set<string>>(new Set());

  const [editingRoute, setEditingRoute] = useState<RouteConfig | null>(null);
  const [editingAction, setEditingAction] = useState<ActionConfig | null>(null);

  useEffect(() => {
    const keys = getLocalStorageKeys();
    setAvailableLocalKeys(keys);

    const existingActions = defaultProfile.actions || [];
    setActions(existingActions.filter(a => a.source !== 'local'));

    const localKeys = (existingActions.filter(a => a.source === 'local').map(a => a.localKey || a.name.toLowerCase().replace(/\s+/g, '_')));
    setSelectedLocalKeys(new Set(localKeys));
  }, []);

  const handleSubmit = () => {
    const localActions: ActionConfig[] = Array.from(selectedLocalKeys).map((key) => ({
      name: key,
      source: 'local' as const,
      localKey: key,
      description: `Read local data: ${key}`,
    }));

    const profile: GuestProfile = {
      role,
      mission,
      responsibilities: responsibilities.split('\n').map((r) => r.trim()).filter(Boolean),
      baseUrl: baseUrl || undefined,
      routes: routes.length ? routes : undefined,
      actions: [...localActions, ...actions].length ? [...localActions, ...actions] : undefined,
    };
    onSave(profile);
  };

  const addRoute = () => {
    setEditingRoute({ name: '', path: '', description: '' });
  };

  const saveRoute = (route: RouteConfig) => {
    const existing = routes.findIndex((r) => r.name === route.name);
    if (existing >= 0) {
      setRoutes(routes.map((r, i) => (i === existing ? route : r)));
    } else {
      setRoutes([...routes, route]);
    }
    setEditingRoute(null);
  };

  const deleteRoute = (name: string) => {
    setRoutes(routes.filter((r) => r.name !== name));
  };

  const addAction = () => {
    setEditingAction({ name: '', endpoint: '', method: 'GET', description: '', params: [] });
  };

  const saveAction = (action: ActionConfig) => {
    const existing = actions.findIndex((a) => a.name === action.name);
    if (existing >= 0) {
      setActions(actions.map((a, i) => (i === existing ? action : a)));
    } else {
      setActions([...actions, action]);
    }
    setEditingAction(null);
  };

  const deleteAction = (name: string) => {
    setActions(actions.filter((a) => a.name !== name));
  };

  const SectionButton = ({ section, icon: Icon, label }: { section: ConfigSection; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
        activeSection === section ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100 text-gray-600'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Guest Setup</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-32 border-r border-gray-200 p-2 space-y-1">
          <SectionButton section="basic" icon={Cog} label="Basic" />
          <SectionButton section="routes" icon={Link} label="Routes" />
          <SectionButton section="actions" icon={ExternalLink} label="Actions" />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
                <textarea
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities (one per line)</label>
                <textarea
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 h-32 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL (optional)</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://api.example.com"
                />
                <p className="text-xs text-gray-500 mt-1">Base URL for API endpoints</p>
              </div>
            </div>
          )}

          {activeSection === 'routes' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Navigation Routes</h4>
                <button onClick={addRoute} className="text-xs flex items-center text-green-600 hover:text-green-700">
                  <Plus className="w-3 h-3 mr-1" /> Add Route
                </button>
              </div>
              {routes.length === 0 && !editingRoute && (
                <p className="text-xs text-gray-500">No routes added. Add routes for navigation.</p>
              )}
              {routes.map((route) => (
                <div key={route.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{route.name}</div>
                    <div className="text-xs text-gray-500">{route.path}</div>
                  </div>
                  <button onClick={() => deleteRoute(route.name)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {editingRoute && (
                <RouteEditor route={editingRoute} onSave={saveRoute} onCancel={() => setEditingRoute(null)} />
              )}
            </div>
          )}

          {activeSection === 'actions' && (
            <div className="space-y-4">
              {availableLocalKeys.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Local Data (auto-detected)</h4>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {availableLocalKeys.map((key) => (
                      <label key={key} className="flex items-center p-1 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedLocalKeys.has(key)}
                          onChange={(e) => {
                            const newSet = new Set(selectedLocalKeys);
                            if (e.target.checked) {
                              newSet.add(key);
                            } else {
                              newSet.delete(key);
                            }
                            setSelectedLocalKeys(newSet);
                          }}
                          className="mr-2"
                        />
                        {key}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">API Actions</h4>
                <button onClick={addAction} className="text-xs flex items-center text-green-600 hover:text-green-700">
                  <Plus className="w-3 h-3 mr-1" /> Add Action
                </button>
              </div>
              {actions.length === 0 && !editingAction && (
                <p className="text-xs text-gray-500">No actions added. Add API actions.</p>
              )}
              {actions.map((action) => (
                <div key={action.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{action.name}</div>
                    <div className="text-xs text-gray-500">
                      {action.source === 'local' ? `local: ${action.localKey}` : `${action.method} ${action.endpoint}`}
                    </div>
                  </div>
                  <button onClick={() => deleteAction(action.name)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {editingAction && (
                <ActionEditor action={editingAction} onSave={saveAction} onCancel={() => setEditingAction(null)} />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Profile
        </button>
      </div>
    </div>
  );
};

interface RouteEditorProps {
  route: RouteConfig;
  onSave: (route: RouteConfig) => void;
  onCancel: () => void;
}

const RouteEditor: React.FC<RouteEditorProps> = ({ route, onSave, onCancel }) => {
  const [name, setName] = useState(route.name);
  const [path, setPath] = useState(route.path);
  const [description, setDescription] = useState(route.description || '');

  const handleSave = () => {
    if (!name || !path) return;
    onSave({ name, path, description: description || undefined });
  };

  return (
    <div className="p-3 border border-green-300 rounded-lg bg-green-50 space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Route name (e.g., Product Details)"
      />
      <input
        type="text"
        value={path}
        onChange={(e) => setPath(e.target.value)}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Path (e.g., /products/{id})"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Description (optional)"
      />
      <div className="flex space-x-2">
        <button onClick={handleSave} className="flex-1 bg-green-600 text-white rounded px-2 py-1 text-sm">
          Save
        </button>
        <button onClick={onCancel} className="px-2 py-1 text-sm text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
};

interface ActionEditorProps {
  action: ActionConfig;
  onSave: (action: ActionConfig) => void;
  onCancel: () => void;
}

const ActionEditor: React.FC<ActionEditorProps> = ({ action, onSave, onCancel }) => {
  const [name, setName] = useState(action.name);
  const [endpoint, setEndpoint] = useState(action.endpoint || '');
  const [method, setMethod] = useState(action.method || 'GET');
  const [description, setDescription] = useState(action.description || '');
  const [params, setParams] = useState(action.params || []);
  const [source, setSource] = useState<'api' | 'local'>(action.source || 'api');
  const [localKey, setLocalKey] = useState(action.localKey || '');
  const [editingParam, setEditingParam] = useState<{ name: string; type: string; required: boolean; description: string } | null>(null);

  const handleSave = () => {
    if (!name) return;
    if (source === 'api') {
      if (!endpoint) return;
      onSave({
        name,
        endpoint,
        method,
        description: description || undefined,
        params: params.length ? params : undefined,
        source: 'api',
      });
    } else {
      onSave({
        name,
        description: description || undefined,
        source: 'local',
        localKey: localKey || name.toLowerCase().replace(/\s+/g, '_'),
      });
    }
  };

  const addParam = () => {
    setEditingParam({ name: '', type: 'string', required: false, description: '' });
  };

  const saveParam = (param: { name: string; type: string; required: boolean; description: string }) => {
    const newParam = { name: param.name, type: param.type as 'string' | 'number' | 'boolean', required: param.required, description: param.description || undefined };
    const existing = params.findIndex((p) => p.name === param.name);
    if (existing >= 0) {
      setParams(params.map((p, i) => (i === existing ? newParam : p)));
    } else {
      setParams([...params, newParam]);
    }
    setEditingParam(null);
  };

  const deleteParam = (paramName: string) => {
    setParams(params.filter((p) => p.name !== paramName));
  };

  return (
    <div className="p-3 border border-green-300 rounded-lg bg-green-50 space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Action name"
      />

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setSource('api')}
          className={`flex-1 py-1 text-xs rounded ${source === 'api' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          API
        </button>
        <button
          type="button"
          onClick={() => setSource('local')}
          className={`flex-1 py-1 text-xs rounded ${source === 'local' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Local
        </button>
      </div>

      {source === 'api' ? (
        <>
          <div className="flex space-x-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as 'GET' | 'POST')}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="/api/endpoint"
            />
          </div>
        </>
      ) : (
        <input
          type="text"
          value={localKey}
          onChange={(e) => setLocalKey(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          placeholder="localStorage key (e.g., my_cart)"
        />
      )}

      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        placeholder="Description"
      />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600">Parameters</span>
          <button onClick={addParam} className="text-xs text-green-600">+ Add</button>
        </div>
        {params.map((p) => (
          <div key={p.name} className="flex items-center justify-between text-xs bg-white p-1 rounded">
            <span>
              {p.name} ({p.type}){p.required ? '*' : ''}
            </span>
            <button onClick={() => deleteParam(p.name)} className="text-red-400">×</button>
          </div>
        ))}
        {editingParam && (
          <div className="space-y-2 p-2 bg-white rounded">
            <input
              type="text"
              value={editingParam.name}
              onChange={(e) => setEditingParam({ ...editingParam, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="Param name"
            />
            <div className="flex space-x-2">
              <select
                value={editingParam.type}
                onChange={(e) => setEditingParam({ ...editingParam, type: e.target.value })}
                className="border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
              </select>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={editingParam.required}
                  onChange={(e) => setEditingParam({ ...editingParam, required: e.target.checked })}
                  className="mr-1"
                />
                Required
              </label>
            </div>
            <input
              type="text"
              value={editingParam.description}
              onChange={(e) => setEditingParam({ ...editingParam, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="Description"
            />
            <button onClick={() => saveParam(editingParam)} className="w-full bg-green-600 text-white rounded px-2 py-1 text-xs">
              Save Param
            </button>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button onClick={handleSave} className="flex-1 bg-green-600 text-white rounded px-2 py-1 text-sm">
          Save
        </button>
        <button onClick={onCancel} className="px-2 py-1 text-sm text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InitView;