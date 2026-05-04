import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../services/review.service';

export const reviewsQueryKey = (productId: number) =>
  ['reviews', productId] as const;

export const useProductReviews = (productId: number) => {
  return useQuery({
    queryKey: reviewsQueryKey(productId),
    queryFn: () => reviewService.getByProduct(productId),
    enabled: !!productId,
  });
};
