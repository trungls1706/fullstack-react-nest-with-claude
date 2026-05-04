import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateReview } from './useCreateReview';

vi.mock('../services/review.service', () => ({
  reviewService: {
    create: vi.fn(),
  },
}));

import { reviewService } from '../services/review.service';

const mockReview = {
  id: 10,
  userId: 5,
  productId: 3,
  orderId: 100,
  rating: 5,
  comment: 'Excellent!',
  createdAt: '2024-01-22T10:00:00Z',
  user: { id: 5, fullName: 'Le Van C' },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCreateReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call reviewService.create with productId and payload', async () => {
    vi.mocked(reviewService.create).mockResolvedValue(mockReview);

    const { result } = renderHook(() => useCreateReview(3), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ orderId: 100, rating: 5, comment: 'Excellent!' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(reviewService.create).toHaveBeenCalledWith(3, {
      orderId: 100,
      rating: 5,
      comment: 'Excellent!',
    });
  });

  it('should return created review data on success', async () => {
    vi.mocked(reviewService.create).mockResolvedValue(mockReview);

    const { result } = renderHook(() => useCreateReview(3), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ orderId: 100, rating: 5 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockReview);
  });

  it('should return error state when API fails', async () => {
    vi.mocked(reviewService.create).mockRejectedValue(
      new Error('Already reviewed'),
    );

    const { result } = renderHook(() => useCreateReview(3), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ orderId: 100, rating: 4 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
