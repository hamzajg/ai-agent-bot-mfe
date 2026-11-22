import { User } from '../../shared/types';
import { readJSON, writeJSON } from '../../shared/utils/storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  shopName: string;
}

type StoredUser = User & {
  passwordHash?: string;
  salt?: string;
  /** Legacy plaintext field; migrated on successful login. */
  password?: string;
};

const AUTH_KEY = 'shop_owner_auth';
const USERS_KEY = 'shop_owners';

function buf2hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(password + salt);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return buf2hex(digest);
}

function makeSalt(): string {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return buf2hex(bytes.buffer);
  }
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function publicUser(user: StoredUser): User {
  return {
    id: user.id,
    email: user.email,
    shopName: user.shopName,
    createdAt: user.createdAt,
  };
}

class AuthService {
  private static getUsers(): Record<string, StoredUser> {
    return readJSON(USERS_KEY, {});
  }

  private static saveUsers(users: Record<string, StoredUser>) {
    writeJSON(USERS_KEY, users);
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
    const email = data.email.toLowerCase();

    if (users[email]) {
      throw new Error('Email already registered');
    }

    const salt = makeSalt();
    const passwordHash = await hashPassword(data.password, salt);
    const user: StoredUser = {
      id: Math.random().toString(36).slice(2),
      email,
      shopName: data.shopName,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };

    users[email] = user;
    this.saveUsers(users);

    return publicUser(user);
  }

  static async login(creds: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getUsers();
    const email = creds.email.toLowerCase();
    const user = users[email];

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.passwordHash && user.salt) {
      const candidate = await hashPassword(creds.password, user.salt);
      if (candidate !== user.passwordHash) {
        throw new Error('Invalid credentials');
      }
    } else if (typeof user.password === 'string') {
      // Legacy plaintext record: verify, then upgrade to salted hash.
      if (user.password !== creds.password) {
        throw new Error('Invalid credentials');
      }
      const salt = makeSalt();
      user.passwordHash = await hashPassword(creds.password, salt);
      user.salt = salt;
      delete user.password;
      users[email] = user;
      this.saveUsers(users);
    } else {
      throw new Error('Invalid credentials');
    }

    const pub = publicUser(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user: pub }));
    return pub;
  }

  static logout() {
    localStorage.removeItem(AUTH_KEY);
  }
}

export default AuthService;