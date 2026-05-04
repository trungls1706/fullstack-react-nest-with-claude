import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CART_QUERY_KEY } from '@/features/cart/hooks/useCart';
import { useCartStore } from '@/features/cart/stores/cart.store';
import { checkoutService } from '../services/checkout.service';
import type { CreateOrderPayload } from '../types/checkout.types';

export const useCheckout = () => {
  const queryClient = useQueryClient();
  const resetCount = useCartStore((s) => s.resetCount);

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      checkoutService.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      resetCount();
    },
  });
};
