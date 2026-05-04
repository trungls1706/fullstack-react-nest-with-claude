import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/review.service';
import { reviewsQueryKey } from './useProductReviews';

export const useDeleteReview = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => reviewService.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey(productId) });
    },
  });
};
