import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/order.service';

export const ORDER_QUERY_KEY = (id: number) => ['orders', id] as const;

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ORDER_QUERY_KEY(id),
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
};
