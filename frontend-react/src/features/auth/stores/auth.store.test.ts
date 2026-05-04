import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './auth.store';
import { getAccessToken, setAccessToken } from '@/shared/lib/axios';
import type { AuthUser } from '../types/auth.types';

const buildUser = (): AuthUser => ({
  id: 1,
  email: 'a@b.com',
  fullName: 'Tester',
  phone: null,
  role: 'customer',
});

describe('useAuthStore', () => {
  beforeEach(() => {
    setAccessToken(null);
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it('setSession persists token and marks authenticated', () => {
    useAuthStore.getState().setSession('jwt.token', buildUser());

    expect(getAccessToken()).toBe('jwt.token');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('a@b.com');
  });

  it('setUser updates user and recomputes isAuthenticated', () => {
    useAuthStore.getState().setUser(buildUser());
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('clear wipes token and user', () => {
    useAuthStore.getState().setSession('tok', buildUser());
    useAuthStore.getState().clear();

    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
