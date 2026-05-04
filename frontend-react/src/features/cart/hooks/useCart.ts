import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../stores/cart.store';

export const CART_QUERY_KEY = ['cart'] as const;

export const useCart = () => {
  const setCartCount = useCartStore((s) => s.setCartCount);

  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const res = await cartService.getCart();
      return res.data.data;
    },
  });

  useEffect(() => {
    if (query.data) {
      const total = query.data.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      setCartCount(total);
    }
  }, [query.data, setCartCount]);

  return query;
};
