import { create } from 'zustand';
import { clearAccessToken, setAccessToken } from '@/shared/lib/axios';
import type { AuthUser, LoginResponse } from '../types/auth.types';

interface AuthState {
  user: Pick<AuthUser, 'id' | 'email' | 'fullName' | 'role'> | null;
  isAuthenticated: boolean;
  setLoginData: (data: LoginResponse) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setLoginData: (data: LoginResponse) => {
    setAccessToken(data.accessToken);
    set({ user: data.user, isAuthenticated: true });
  },

  setUser: (user: AuthUser) => {
    set({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      isAuthenticated: true,
    });
  },

  logout: () => {
    clearAccessToken();
    set({ user: null, isAuthenticated: false });
  },
}));
