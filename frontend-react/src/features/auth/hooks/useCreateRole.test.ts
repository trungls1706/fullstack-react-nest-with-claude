import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useCreateRole } from './useCreateRole';

vi.mock('../services/role.service', () => ({
  roleService: {
    create: vi.fn(),
  },
}));

import { roleService } from '../services/role.service';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCreateRole', () => {
  it('should call roleService.create with payload on mutate', async () => {
    vi.mocked(roleService.create).mockResolvedValue({
      data: { success: true, data: { id: 3, name: 'editor' } },
    } as never);

    const { result } = renderHook(() => useCreateRole(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ name: 'editor' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(roleService.create).toHaveBeenCalledWith({ name: 'editor' });
  });

  it('should be in idle state initially', () => {
    const { result } = renderHook(() => useCreateRole(), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should set isError on API failure', async () => {
    vi.mocked(roleService.create).mockRejectedValue(new Error('Conflict'));

    const { result } = renderHook(() => useCreateRole(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ name: 'admin' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('should invalidate roles query on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(roleService.create).mockResolvedValue({
      data: { success: true, data: { id: 3, name: 'editor' } },
    } as never);

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useCreateRole(), { wrapper });

    act(() => {
      result.current.mutate({ name: 'editor' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['admin', 'roles'] }),
    );
  });
});
