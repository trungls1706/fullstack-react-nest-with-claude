import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUpdateUser } from './useUpdateUser';

vi.mock('../services/user.service', () => ({
  userService: {
    update: vi.fn(),
  },
}));

import { userService } from '../services/user.service';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useUpdateUser', () => {
  it('should be in idle state initially', () => {
    const { result } = renderHook(() => useUpdateUser(1), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should call userService.update with id and payload', async () => {
    vi.mocked(userService.update).mockResolvedValue({
      data: { success: true, data: { id: 1, fullName: 'Updated' } },
    } as never);

    const { result } = renderHook(() => useUpdateUser(1), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ fullName: 'Updated', roleId: 2 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(userService.update).toHaveBeenCalledWith(1, { fullName: 'Updated', roleId: 2 });
  });

  it('should set isError when update fails', async () => {
    vi.mocked(userService.update).mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useUpdateUser(1), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ fullName: 'Updated' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('should invalidate users queries on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(userService.update).mockResolvedValue({
      data: { success: true, data: { id: 1, fullName: 'Updated' } },
    } as never);

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useUpdateUser(1), { wrapper });

    act(() => {
      result.current.mutate({ fullName: 'Updated' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['admin', 'users'] }),
    );
  });
});
