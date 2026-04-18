import { Action } from '../../shared/types';
import { readJSON } from '../../shared/utils/storage';

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

const role = adminCfg.role || env.VITE_AGENT_ROLE || 'AI Shopping Assistant';
const mission =
  adminCfg.mission ||
  env.VITE_AGENT_MISSION ||
  'Help users browse products, answer store-related questions, and perform lookups while being concise, friendly, and accurate.';

const responsibilities =
  (Array.isArray(adminCfg.responsibilities) ? adminCfg.responsibilities : undefined) ||
  parseJsonArray<string>(env.VITE_AGENT_RESPONSIBILITIES) || [
    'Answer general store and product questions.',
    'Assist with basic shopping flows.',
    'When asked to find/search/lookup a product, request or extract the query and use the Products Search action.',
    'Help add items to cart, remove items from cart, and view cart summary.',
    'Guide the user through checkout, order creation, and order confirmation when requested.',
    'Never invent data; if unknown, ask a clarifying question.',
    'Keep responses short and actionable.',
  ];

const actions =
  (Array.isArray(adminCfg.actions) ? (adminCfg.actions as Action[]) : undefined) ||
  parseJsonArray<Action>(env.VITE_AGENT_ACTIONS_JSON) ||
  defaultActions;

export const agentProfile = {
  role,
  mission,
  responsibilities,
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
  lines.push(`# Actions`);
  for (const a of agentProfile.actions) {
    lines.push(`- ${a.name}: ${a.description}`);
    lines.push(`  Endpoint: ${a.method} ${a.endpoint}`);
    if (a.params && Object.keys(a.params).length) {
      lines.push(`  Params:`);
      for (const [k, v] of Object.entries(a.params)) lines.push(`    - ${k}: ${v}`);
    }
  }
  lines.push('');
  lines.push(
    'Behavior: Prefer concise answers. Ask for clarification if the user request is ambiguous.'
  );
  lines.push(
    'When you want the client to execute an action, respond with ONLY a single JSON object on one line, no extra text, in the following shape:'
  );
  lines.push('{"action":"<Action Name>","params":{"<key>":"<value>"}}');
  lines.push(
    'Example: {"action":"Products Search","params":{"text":"wireless headphones"}}'
  );
  return lines.join('\n');
}