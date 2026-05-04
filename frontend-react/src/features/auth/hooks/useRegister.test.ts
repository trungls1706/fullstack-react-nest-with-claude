import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRegister } from './useRegister';

vi.mock('../services/auth.service', () => ({
  authService: {
    register: vi.fn(),
  },
}));

import { authService } from '../services/auth.service';

const mockRegisterResponse = {
  data: {
    data: {
      id: 1,
      email: 'new@test.com',
      fullName: 'New User',
      role: 'customer',
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

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return idle state initially', () => {
    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should call authService.register with payload', async () => {
    vi.mocked(authService.register).mockResolvedValue(mockRegisterResponse as never);

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    result.current.mutate({
      email: 'new@test.com',
      password: 'password123',
      fullName: 'New User',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(authService.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@test.com' }),
    );
    expect(result.current.data).toEqual(mockRegisterResponse.data.data);
  });

  it('should set error state on registration failure', async () => {
    vi.mocked(authService.register).mockRejectedValue(new Error('Email already exists'));

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    result.current.mutate({
      email: 'existing@test.com',
      password: 'password123',
      fullName: 'User',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('should call register exactly once per mutate call', async () => {
    vi.mocked(authService.register).mockResolvedValue(mockRegisterResponse as never);

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    result.current.mutate({
      email: 'new@test.com',
      password: 'password123',
      fullName: 'New User',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(authService.register).toHaveBeenCalledTimes(1);
  });
});
