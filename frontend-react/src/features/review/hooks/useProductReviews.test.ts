import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProductReviews } from './useProductReviews';

vi.mock('../services/review.service', () => ({
  reviewService: {
    getByProduct: vi.fn(),
  },
}));

import { reviewService } from '../services/review.service';

const mockReviewsResponse = {
  success: true,
  data: [
    {
      id: 1,
      userId: 10,
      productId: 5,
      orderId: 100,
      rating: 5,
      comment: 'Great product!',
      createdAt: '2024-01-20T10:00:00Z',
      user: { id: 10, fullName: 'Nguyen Van A' },
    },
    {
      id: 2,
      userId: 11,
      productId: 5,
      orderId: 101,
      rating: 4,
      comment: 'Good quality',
      createdAt: '2024-01-21T10:00:00Z',
      user: { id: 11, fullName: 'Tran Thi B' },
    },
  ],
  meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useProductReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.mocked(reviewService.getByProduct).mockResolvedValue(mockReviewsResponse);

    const { result } = renderHook(() => useProductReviews(5), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return reviews on success', async () => {
    vi.mocked(reviewService.getByProduct).mockResolvedValue(mockReviewsResponse);

    const { result } = renderHook(() => useProductReviews(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.data[0].rating).toBe(5);
  });

  it('should not fetch when productId is 0', () => {
    vi.mocked(reviewService.getByProduct).mockResolvedValue(mockReviewsResponse);

    const { result } = renderHook(() => useProductReviews(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(reviewService.getByProduct).not.toHaveBeenCalled();
  });

  it('should call reviewService.getByProduct with correct productId', async () => {
    vi.mocked(reviewService.getByProduct).mockResolvedValue(mockReviewsResponse);

    const { result } = renderHook(() => useProductReviews(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(reviewService.getByProduct).toHaveBeenCalledWith(5);
  });

  it('should return error state when API fails', async () => {
    vi.mocked(reviewService.getByProduct).mockRejectedValue(
      new Error('Not found'),
    );

    const { result } = renderHook(() => useProductReviews(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
