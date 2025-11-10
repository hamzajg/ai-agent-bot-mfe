// Simple local storage based auth service for demo
// In production, this should use a proper backend API

export interface User {
  id: string;
  email: string;
  shopName: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  shopName: string;
}

const AUTH_KEY = 'shop_owner_auth';
const USERS_KEY = 'shop_owners';

export class AuthService {
  private static getUsers(): Record<string, User & { password: string }> {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private static saveUsers(users: Record<string, User & { password: string }>) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  static isLoggedIn(): boolean {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return Boolean(data?.user?.id);
    } catch {
      return false;
    }
  }

  static getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data?.user || null;
    } catch {
      return null;
    }
  }

  static async register(data: RegisterData): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getUsers();
    
    // Check if email exists
    if (users[data.email.toLowerCase()]) {
      throw new Error('Email already registered');
    }

    const user: User & { password: string } = {
      id: Math.random().toString(36).slice(2),
      email: data.email.toLowerCase(),
      shopName: data.shopName,
      password: data.password, // In real app, hash the password
      createdAt: new Date().toISOString()
    };

    users[user.email] = user;
    this.saveUsers(users);

    const { password: _, ...publicUser } = user;
    return publicUser;
  }

  static async login(creds: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getUsers();
    const user = users[creds.email.toLowerCase()];

    if (!user || user.password !== creds.password) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...publicUser } = user;
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user: publicUser }));
    return publicUser;
  }

  static logout() {
    localStorage.removeItem(AUTH_KEY);
  }
}