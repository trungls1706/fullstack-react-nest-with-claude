import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cart.service';
import type { UpdateCartItemPayload } from '../types/cart.types';
import { CART_QUERY_KEY } from './useCart';

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: UpdateCartItemPayload }) =>
      cartService.updateItem(itemId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};
