import { Product } from '../types';

export const productService = {
  async search(query: string): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    try {
      const base = (window as any).__CHATBOT_ASSETS_BASE__ as string | undefined;
      const url = `${base ? base.replace(/\/$/, '') : ''}/assets/products.json`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return [];
      const data = (await res.json()) as Product[];
      return data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    } catch (e) {
      console.warn('Failed to load products.json', e);
      return [];
    }
  },
};