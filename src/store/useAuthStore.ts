import { create } from 'zustand';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'auth.access_token';
const REFRESH_TOKEN_KEY = 'auth.refresh_token';
const USER_KEY = 'auth.user';

export interface AuthUser {
  id: number | string;
  username: string;
  groups: string[];
  is_admin: boolean;
  permissions: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  permissions: string[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  initialize: () => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

const loadUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const user = loadUser();

  return {
    accessToken,
    refreshToken,
    user,
    permissions: user?.permissions || [],
    isAuthenticated: Boolean(accessToken),
    isAdmin: Boolean(user?.is_admin),
    login: async (username: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Connexion échouée');
      }

      const data = await response.json();
      const nextUser: AuthUser | null = data.user || null;

      localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
      if (nextUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      } else {
        localStorage.removeItem(USER_KEY);
      }

      set({
        accessToken: data.access,
        refreshToken: data.refresh,
        user: nextUser,
        permissions: nextUser?.permissions || [],
        isAuthenticated: true,
        isAdmin: Boolean(nextUser?.is_admin)
      });

      if (!nextUser) {
        await get().fetchMe();
      }
    },
    fetchMe: async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Impossible de récupérer le profil');
      }

      const data = await response.json();
      const nextUser: AuthUser | null = data.user || null;

      if (nextUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      }

      set({
        user: nextUser,
        permissions: nextUser?.permissions || [],
        isAuthenticated: Boolean(token),
        isAdmin: Boolean(nextUser?.is_admin)
      });
    },
    initialize: async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) return;
      try {
        await get().fetchMe();
      } catch {
        get().logout();
      }
    },
    logout: () => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        permissions: [],
        isAuthenticated: false,
        isAdmin: false
      });
    },
    hasPermission: (permission: string) => {
      return get().permissions.includes(permission);
    },
    hasAnyPermission: (permissions: string[]) => {
      const current = get().permissions;
      return permissions.some((permission) => current.includes(permission));
    },
  };
});

export const clearAuthStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
