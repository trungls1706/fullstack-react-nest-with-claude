import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cart.service';
import type { AddToCartPayload } from '../types/cart.types';
import { CART_QUERY_KEY } from './useCart';

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartPayload) => cartService.addItem(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};
