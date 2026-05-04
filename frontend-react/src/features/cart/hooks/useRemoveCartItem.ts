import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cart.service';
import { CART_QUERY_KEY } from './useCart';

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => cartService.removeItem(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};
