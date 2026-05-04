import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useCreateCategory } from './useCreateCategory';

vi.mock('../services/category.service', () => ({
  categoryService: {
    create: vi.fn(),
  },
}));

import { categoryService } from '../services/category.service';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCreateCategory', () => {
  it('should be in idle state initially', () => {
    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should call categoryService.create with payload on mutate', async () => {
    vi.mocked(categoryService.create).mockResolvedValue({
      data: { success: true, data: { id: 1, name: 'Electronics', slug: 'electronics', parentId: null } },
    } as never);

    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: 'Electronics', slug: 'electronics' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(categoryService.create).toHaveBeenCalledWith({
      name: 'Electronics',
      slug: 'electronics',
    });
  });

  it('should set isError on API failure', async () => {
    vi.mocked(categoryService.create).mockRejectedValue(
      new Error('Conflict'),
    );

    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: 'Electronics', slug: 'electronics' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('should invalidate categories query on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(categoryService.create).mockResolvedValue({
      data: { success: true, data: { id: 1, name: 'Electronics', slug: 'electronics', parentId: null } },
    } as never);

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useCreateCategory(), { wrapper });

    act(() => {
      result.current.mutate({ name: 'Electronics', slug: 'electronics' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['categories'] }),
    );
  });
});
