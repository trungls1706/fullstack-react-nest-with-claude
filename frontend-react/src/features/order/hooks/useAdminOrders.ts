import { useQuery } from '@tanstack/react-query';
import { orderService, type OrderListParams } from '../services/order.service';

export const adminOrdersQueryKey = (params?: OrderListParams) =>
  ['admin', 'orders', params] as const;

export const useAdminOrders = (params?: OrderListParams) => {
  return useQuery({
    queryKey: adminOrdersQueryKey(params),
    queryFn: () => orderService.adminGetAll(params),
  });
};
