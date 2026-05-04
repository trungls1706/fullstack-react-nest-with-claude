import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../stores/cart.store';
import { CART_QUERY_KEY } from './useCart';

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const resetCount = useCartStore((s) => s.resetCount);

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      resetCount();
    },
  });
};
