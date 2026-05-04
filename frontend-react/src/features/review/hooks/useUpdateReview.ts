import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/review.service';
import { reviewsQueryKey } from './useProductReviews';
import type { UpdateReviewPayload } from '../types/review.types';

export const useUpdateReview = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: number;
      data: UpdateReviewPayload;
    }) => reviewService.update(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey(productId) });
    },
  });
};
