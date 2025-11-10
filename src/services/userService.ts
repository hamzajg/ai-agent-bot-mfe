export interface User {
  id: string;
  name: string;
  email: string;
}

export const userService = {
  async search(query: string): Promise<User[]> {
    // Extract keywords from the user message
    const q = encodeURIComponent(query);
    const res = await fetch(`/api/users?query=${q}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data as User[] : [];
  },
};
