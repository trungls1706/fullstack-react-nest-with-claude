import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUsers } from './useUsers';

vi.mock('../services/user.service', () => ({
  userService: {
    getAll: vi.fn(),
  },
}));

import { userService } from '../services/user.service';

const mockPaginatedResponse = {
  data: [
    {
      id: 1,
      email: 'admin@example.com',
      fullName: 'Admin User',
      phone: null,
      roleId: 1,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useUsers', () => {
  it('should return loading state initially', () => {
    vi.mocked(userService.getAll).mockResolvedValue({
      data: mockPaginatedResponse,
    } as never);

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return paginated data on success', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({
      data: mockPaginatedResponse,
    } as never);

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].email).toBe('admin@example.com');
    expect(result.current.data?.meta.total).toBe(1);
  });

  it('should return error state when API fails', async () => {
    vi.mocked(userService.getAll).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('should pass query params to userService.getAll', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({
      data: mockPaginatedResponse,
    } as never);

    const params = { page: 2, limit: 5 };
    const { result } = renderHook(() => useUsers(params), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(userService.getAll).toHaveBeenCalledWith(params);
  });

  it('should call userService.getAll exactly once on mount', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({
      data: mockPaginatedResponse,
    } as never);

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(userService.getAll).toHaveBeenCalledTimes(1);
  });
});
