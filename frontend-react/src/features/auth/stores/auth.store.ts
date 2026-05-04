import { create } from 'zustand';
import { getAccessToken, setAccessToken } from '@/shared/lib/axios';
import type { AuthUser } from '../types/auth.types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: Boolean(getAccessToken()),
  setSession: (token, user) => {
    setAccessToken(token);
    set({ user, isAuthenticated: true });
  },
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  clear: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },
}));
