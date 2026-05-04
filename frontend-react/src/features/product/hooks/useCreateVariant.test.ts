import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useCreateVariant } from './useCreateVariant';

vi.mock('../services/product.service', () => ({
  productService: {
    createVariant: vi.fn(),
  },
}));

import { productService } from '../services/product.service';

const mockVariant = {
  id: 1,
  productId: 10,
  sku: 'SHIRT-WHITE-L',
  color: 'White',
  size: 'L',
  price: 250000,
  salePrice: null,
  stockQuantity: 100,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCreateVariant', () => {
  it('should be in idle state initially', () => {
    const { result } = renderHook(() => useCreateVariant(10), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should call productService.createVariant with productId and payload', async () => {
    vi.mocked(productService.createVariant).mockResolvedValue({
      data: { success: true, data: mockVariant },
    } as never);

    const { result } = renderHook(() => useCreateVariant(10), {
      wrapper: createWrapper(),
    });

    const payload = {
      sku: 'SHIRT-WHITE-L',
      color: 'White',
      size: 'L',
      price: 250000,
      stockQuantity: 100,
    };

    act(() => {
      result.current.mutate(payload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(productService.createVariant).toHaveBeenCalledWith(10, payload);
  });

  it('should set isError on API failure', async () => {
    vi.mocked(productService.createVariant).mockRejectedValue(
      new Error('SKU already exists'),
    );

    const { result } = renderHook(() => useCreateVariant(10), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        sku: 'DUPLICATE-SKU',
        price: 250000,
        stockQuantity: 10,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('should invalidate product variants query on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(productService.createVariant).mockResolvedValue({
      data: { success: true, data: mockVariant },
    } as never);

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useCreateVariant(10), { wrapper });

    act(() => {
      result.current.mutate({ sku: 'SHIRT-WHITE-L', price: 250000, stockQuantity: 100 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: expect.arrayContaining(['products', 10, 'variants']),
      }),
    );
  });
});
