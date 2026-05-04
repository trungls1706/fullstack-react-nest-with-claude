import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProductVariants } from './useProductVariants';

vi.mock('../services/product.service', () => ({
  productService: {
    getVariants: vi.fn(),
  },
}));

import { productService } from '../services/product.service';

const mockVariants = [
  {
    id: 1,
    productId: 10,
    sku: 'IPHONE-WHITE-128',
    color: 'White',
    size: null,
    price: 25000000,
    salePrice: null,
    stockQuantity: 50,
  },
  {
    id: 2,
    productId: 10,
    sku: 'IPHONE-BLACK-128',
    color: 'Black',
    size: null,
    price: 25000000,
    salePrice: 24000000,
    stockQuantity: 30,
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useProductVariants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.mocked(productService.getVariants).mockResolvedValue({
      data: { success: true, data: mockVariants },
    } as never);

    const { result } = renderHook(() => useProductVariants(10), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return variants data on success', async () => {
    vi.mocked(productService.getVariants).mockResolvedValue({
      data: { success: true, data: mockVariants },
    } as never);

    const { result } = renderHook(() => useProductVariants(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].sku).toBe('IPHONE-WHITE-128');
  });

  it('should return error state when API fails', async () => {
    vi.mocked(productService.getVariants).mockRejectedValue(
      new Error('Not found'),
    );

    const { result } = renderHook(() => useProductVariants(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('should NOT fetch when productId is 0', () => {
    const { result } = renderHook(() => useProductVariants(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(productService.getVariants).not.toHaveBeenCalled();
  });

  it('should call productService.getVariants with correct productId', async () => {
    vi.mocked(productService.getVariants).mockResolvedValue({
      data: { success: true, data: mockVariants },
    } as never);

    const { result } = renderHook(() => useProductVariants(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(productService.getVariants).toHaveBeenCalledWith(10);
  });
});
