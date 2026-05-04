import axiosInstance from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type { Order, OrderListItem } from '../types/order.types';

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const orderService = {
  getAll: (params?: OrderListParams) =>
    axiosInstance
      .get<PaginatedResponse<OrderListItem>>('/orders', { params })
      .then((r) => r.data.data),

  getById: (id: number) =>
    axiosInstance
      .get<ApiResponse<Order>>(`/orders/${id}`)
      .then((r) => r.data.data),

  cancel: (id: number) =>
    axiosInstance
      .patch<ApiResponse<Order>>(`/orders/${id}/cancel`)
      .then((r) => r.data.data),

  adminGetAll: (params?: OrderListParams) =>
    axiosInstance
      .get<PaginatedResponse<OrderListItem>>('/admin/orders', { params })
      .then((r) => r.data.data),
};
