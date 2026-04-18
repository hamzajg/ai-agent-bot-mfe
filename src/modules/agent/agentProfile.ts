import { Action } from '../../shared/types';
import { readJSON, readGuestProfile, GuestProfile, RouteConfig, ActionConfig } from '../../shared/utils/storage';

function parseJsonArray<T>(raw?: string): T[] | undefined {
  if (!raw) return undefined;
  try {
    const val = JSON.parse(raw);
    return Array.isArray(val) ? (val as T[]) : undefined;
  } catch {
    return undefined;
  }
}

const defaultActions: Action[] = [
  {
    name: 'Products Search',
    description:
      'Search products by name or description. Provide short bullet results: description (price).',
    endpoint: '/assets/products.json',
    method: 'GET',
    params: { text: 'Search text such as name or description' },
  },
  {
    name: 'Add To Cart',
    description: 'Add a product to the cart with a given quantity.',
    endpoint: '/assets/cart_add.json',
    method: 'GET',
    params: { productId: 'Product ID', quantity: 'Quantity to add (default 1)' },
  },
  {
    name: 'Remove From Cart',
    description: 'Remove a product from the cart.',
    endpoint: '/assets/cart_remove.json',
    method: 'GET',
    params: { productId: 'Product ID' },
  },
  {
    name: 'View Cart',
    description: 'Retrieve current cart contents.',
    endpoint: '/assets/cart_view.json',
    method: 'GET',
  },
  {
    name: 'Checkout',
    description: 'Begin checkout and return a summary to confirm.',
    endpoint: '/assets/checkout.json',
    method: 'GET',
  },
  {
    name: 'Create Order',
    description: 'Create an order from the current cart with contact and shipping info.',
    endpoint: '/assets/order_create.json',
    method: 'GET',
    params: {
      name: 'Customer full name',
      email: 'Customer email',
      address: 'Shipping address',
    },
  },
  {
    name: 'Confirm Order',
    description: 'Confirm an order by ID and return confirmation details.',
    endpoint: '/assets/order_confirm.json',
    method: 'GET',
    params: { orderId: 'Order ID to confirm' },
  },
];

const env = import.meta.env as any;
const adminCfg = (typeof window !== 'undefined' && (window as any).__AGENT_CONFIG) || {};

const guestProfile = (() => {
  try {
    if (typeof window !== 'undefined') {
      return readGuestProfile();
    }
  } catch {}
  return null;
})();

function getRole(): string {
  if (adminCfg.role) return adminCfg.role;
  if (guestProfile?.role) return guestProfile.role;
  return env.VITE_AGENT_ROLE || 'AI Shopping Assistant';
}

function getMission(): string {
  if (adminCfg.mission) return adminCfg.mission;
  if (guestProfile?.mission) return guestProfile.mission;
  return env.VITE_AGENT_MISSION || 'Help users browse products, answer store-related questions, and perform lookups while being concise, friendly, and accurate.';
}

function getResponsibilities(): string[] {
  if (Array.isArray(adminCfg.responsibilities) && adminCfg.responsibilities.length) return adminCfg.responsibilities;
  if (guestProfile?.responsibilities?.length) return guestProfile.responsibilities;
  const envResp = parseJsonArray<string>(env.VITE_AGENT_RESPONSIBILITIES);
  if (envResp?.length) return envResp;
  return [
    'Answer general store and product questions.',
    'Assist with basic shopping flows.',
    'When asked to find/search/lookup a product, request or extract the query and use the Products Search action.',
    'Help add items to cart, remove items from cart, and view cart summary.',
    'Guide the user through checkout, order creation, and order confirmation when requested.',
    'Never invent data; if unknown, ask a clarifying question.',
    'Keep responses short and actionable.',
  ];
}

function getBaseUrl(): string {
  if (adminCfg.assetsBaseUrl) return adminCfg.assetsBaseUrl;
  if (guestProfile?.baseUrl) return guestProfile.baseUrl;
  return env.VITE_ASSETS_BASE_URL || '';
}

function getRoutes(): RouteConfig[] {
  if (adminCfg.routes?.length) return adminCfg.routes as RouteConfig[];
  const hasGuestRoutes = guestProfile && 'routes' in guestProfile && Array.isArray(guestProfile.routes);
  if (hasGuestRoutes) return guestProfile.routes;
  return [];
}

const role = getRole();
const mission = getMission();
const responsibilities = getResponsibilities();
const baseUrl = getBaseUrl();
const routes = getRoutes();

const actions: Action[] = (() => {
  if (adminCfg.actions?.length) return adminCfg.actions as Action[];

  const hasGuestActions = guestProfile && 'actions' in guestProfile && Array.isArray(guestProfile.actions);
  if (hasGuestActions) {
    return guestProfile.actions.map((a: ActionConfig) => ({
      name: a.name,
      description: a.description || '',
      endpoint: a.endpoint,
      method: a.method,
      params: a.params?.reduce((acc, p) => ({ ...acc, [p.name]: p.description || p.name }), {} as Record<string, string>),
      source: a.source,
      localKey: a.localKey,
    }));
  }

  const envActions = parseJsonArray<Action>(env.VITE_AGENT_ACTIONS_JSON);
  if (envActions?.length) return envActions;
  return [];
})();

export const agentProfile = {
  role,
  mission,
  responsibilities,
  baseUrl,
  routes,
  actions,
} as const;

export function buildSystemPrompt(): string {
  const lines: string[] = [];
  lines.push(`# Role`);
  lines.push(agentProfile.role);
  lines.push('');
  lines.push(`# Mission`);
  lines.push(agentProfile.mission);
  lines.push('');
  lines.push(`# Responsibilities`);
  for (const r of agentProfile.responsibilities) lines.push(`- ${r}`);
  lines.push('');

  if (agentProfile.routes?.length) {
    lines.push(`# Navigation Routes`);
    for (const route of agentProfile.routes) {
      lines.push(`- ${route.name}: ${route.path}`);
      if (route.description) lines.push(`  ${route.description}`);
    }
    lines.push('');
  }

  if (agentProfile.actions?.length) {
    lines.push(`# Actions`);
    for (const a of agentProfile.actions) {
      lines.push(`- ${a.name}: ${a.description || 'Execute an action'}`);

      if (a.source === 'local') {
        const localKey = a.localKey || a.name;
        let localValue: any = null;
        try {
          const raw = localStorage.getItem(localKey);
          if (raw) {
            localValue = JSON.parse(raw);
          }
        } catch {}
        if (localValue !== null) {
          const preview = JSON.stringify(localValue, null, 2).slice(0, 500);
          lines.push(`  Current Value:`);
          lines.push(`${preview}`);
        }
      } else {
        lines.push(`  Endpoint: ${a.method} ${a.endpoint}`);
        if (a.params && Object.keys(a.params).length) {
          lines.push(`  Params:`);
          for (const [k, v] of Object.entries(a.params)) lines.push(`    - ${k}: ${v}`);
        }
      }
    }
    lines.push('');
  }

  if (agentProfile.routes?.length) {
    lines.push(
      'When the user wants to navigate to a page, respond with ONLY a JSON object for navigation:'
    );
    lines.push('{"navigate":"<Route Name>","params":{"<key>":"<value>"}}');
    lines.push('Example: {"navigate":"Product Details","params":{"id":"123"}}');
    lines.push('');
  }

  lines.push(
    'When you want the client to execute an action, respond with ONLY a single JSON object on one line, no extra text:'
  );
  lines.push('{"action":"<Action Name>","params":{"<key>":"<value>"}}');
  lines.push('Example: {"action":"Products Search","params":{"text":"wireless headphones"}}');
  return lines.join('\n');
}