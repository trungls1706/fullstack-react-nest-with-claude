import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCategories } from './useCategories';

vi.mock('../services/category.service', () => ({
  categoryService: {
    getAll: vi.fn(),
  },
}));

import { categoryService } from '../services/category.service';

const mockCategories = [
  { id: 1, parentId: null, name: 'Electronics', slug: 'electronics' },
  { id: 2, parentId: 1, name: 'Phones', slug: 'phones' },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.mocked(categoryService.getAll).mockResolvedValue({
      data: { success: true, data: mockCategories },
    } as never);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return categories data on success', async () => {
    vi.mocked(categoryService.getAll).mockResolvedValue({
      data: { success: true, data: mockCategories },
    } as never);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCategories);
  });

  it('should return error state when API fails', async () => {
    vi.mocked(categoryService.getAll).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('should call categoryService.getAll exactly once on mount', async () => {
    vi.mocked(categoryService.getAll).mockResolvedValue({
      data: { success: true, data: mockCategories },
    } as never);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(categoryService.getAll).toHaveBeenCalledTimes(1);
  });
});
