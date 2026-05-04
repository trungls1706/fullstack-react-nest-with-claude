import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRoles } from './useRoles';

vi.mock('../services/role.service', () => ({
  roleService: {
    getAll: vi.fn(),
  },
}));

import { roleService } from '../services/role.service';

const mockRoles = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'customer' },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.mocked(roleService.getAll).mockResolvedValue({
      data: { success: true, data: mockRoles },
    } as never);

    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return roles data on success', async () => {
    vi.mocked(roleService.getAll).mockResolvedValue({
      data: { success: true, data: mockRoles },
    } as never);

    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockRoles);
  });

  it('should return error state when API fails', async () => {
    vi.mocked(roleService.getAll).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('should call roleService.getAll exactly once on mount', async () => {
    vi.mocked(roleService.getAll).mockResolvedValue({
      data: { success: true, data: mockRoles },
    } as never);

    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(roleService.getAll).toHaveBeenCalledTimes(1);
  });
});
