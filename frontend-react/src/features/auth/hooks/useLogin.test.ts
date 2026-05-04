import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLogin } from './useLogin';

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}));

vi.mock('../stores/auth.store', () => ({
  useAuthStore: vi.fn((selector: (s: { setLoginData: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ setLoginData: vi.fn() }),
  ),
}));

import { authService } from '../services/auth.service';

const mockLoginResponse = {
  data: {
    data: {
      accessToken: 'access_token_123',
      user: { id: 1, email: 'user@test.com', fullName: 'Test User', role: 'customer' },
    },
  },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return idle state initially', () => {
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should call authService.login with credentials', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse as never);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'user@test.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'password123',
    });
  });

  it('should set error state on login failure', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'user@test.com', password: 'wrong' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
