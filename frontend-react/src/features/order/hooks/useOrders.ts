import { useQuery } from '@tanstack/react-query';
import { orderService, type OrderListParams } from '../services/order.service';

export const ORDERS_QUERY_KEY = ['orders'] as const;

export const useOrders = (params?: OrderListParams) => {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, params],
    queryFn: () => orderService.getAll(params),
  });
};
