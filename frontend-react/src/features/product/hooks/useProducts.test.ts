import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProducts } from './useProducts';

vi.mock('../services/product.service', () => ({
  productService: {
    getAll: vi.fn(),
  },
}));

import { productService } from '../services/product.service';

const mockProductsResponse = {
  success: true,
  data: [
    {
      id: 1,
      categoryId: 1,
      name: 'iPhone 15',
      slug: 'iphone-15',
      description: null,
      thumbnailUrl: null,
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

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.mocked(productService.getAll).mockResolvedValue({
      data: mockProductsResponse,
    } as never);

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return paginated data on success', async () => {
    vi.mocked(productService.getAll).mockResolvedValue({
      data: mockProductsResponse,
    } as never);

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].name).toBe('iPhone 15');
    expect(result.current.data?.meta.total).toBe(1);
  });

  it('should return error state when API fails', async () => {
    vi.mocked(productService.getAll).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('should pass params to productService.getAll', async () => {
    vi.mocked(productService.getAll).mockResolvedValue({
      data: mockProductsResponse,
    } as never);

    const params = { page: 2, limit: 20, categoryId: 5 };
    const { result } = renderHook(() => useProducts(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(productService.getAll).toHaveBeenCalledWith(params);
  });

  it('should call productService.getAll exactly once on mount', async () => {
    vi.mocked(productService.getAll).mockResolvedValue({
      data: mockProductsResponse,
    } as never);

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(productService.getAll).toHaveBeenCalledTimes(1);
  });
});
