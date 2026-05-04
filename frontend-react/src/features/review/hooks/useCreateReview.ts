import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/review.service';
import { reviewsQueryKey } from './useProductReviews';
import type { CreateReviewPayload } from '../types/review.types';

export const useCreateReview = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewPayload) =>
      reviewService.create(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey(productId) });
    },
  });
};
