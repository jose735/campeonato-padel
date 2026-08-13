import { create } from 'zustand';

export type UserRole = 'guest' | 'admin';

type AuthState = {
  role: UserRole | null;
  loginAsGuest: () => void;
  loginAsAdmin: (password: string) => boolean;
  logout: () => void;
  hydrate: () => void;
};

const STORAGE_KEY = 'torneo-padel-role';

export const useAuthStore = create<AuthState>((set) => ({
  role: null,

  hydrate: () => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === 'guest' || saved === 'admin') {
      set({ role: saved });
    }
  },

  loginAsGuest: () => {
    sessionStorage.setItem(STORAGE_KEY, 'guest');
    set({ role: 'guest' });
  },

  loginAsAdmin: (password: string) => {
    const expected = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!expected || password !== expected) {
      return false;
    }
    sessionStorage.setItem(STORAGE_KEY, 'admin');
    set({ role: 'admin' });
    return true;
  },

  logout: () => {
    sessionStorage.removeItem(STORAGE_KEY);
    set({ role: null });
  },
}));