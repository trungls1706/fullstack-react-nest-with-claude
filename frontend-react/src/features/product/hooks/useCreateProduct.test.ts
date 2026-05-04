import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useCreateProduct } from './useCreateProduct';

vi.mock('../services/product.service', () => ({
  productService: {
    create: vi.fn(),
  },
}));

import { productService } from '../services/product.service';

const mockProduct = {
  id: 1,
  categoryId: 1,
  name: 'iPhone 15',
  slug: 'iphone-15',
  description: null,
  thumbnailUrl: null,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCreateProduct', () => {
  it('should be in idle state initially', () => {
    const { result } = renderHook(() => useCreateProduct(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should call productService.create with payload on mutate', async () => {
    vi.mocked(productService.create).mockResolvedValue({
      data: { success: true, data: mockProduct },
    } as never);

    const { result } = renderHook(() => useCreateProduct(), {
      wrapper: createWrapper(),
    });

    const payload = { name: 'iPhone 15', slug: 'iphone-15', categoryId: 1 };
    act(() => {
      result.current.mutate(payload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(productService.create).toHaveBeenCalledWith(payload);
  });

  it('should set isError on API failure', async () => {
    vi.mocked(productService.create).mockRejectedValue(
      new Error('Validation error'),
    );

    const { result } = renderHook(() => useCreateProduct(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: 'iPhone 15', slug: 'iphone-15', categoryId: 1 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('should invalidate admin products query on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(productService.create).mockResolvedValue({
      data: { success: true, data: mockProduct },
    } as never);

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useCreateProduct(), { wrapper });

    act(() => {
      result.current.mutate({ name: 'iPhone 15', slug: 'iphone-15', categoryId: 1 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: expect.arrayContaining(['admin', 'products']) }),
    );
  });
});
