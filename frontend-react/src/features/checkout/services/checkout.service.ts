import axiosInstance from '@/shared/lib/axios';
import type { Address, CreateOrderPayload } from '../types/checkout.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const checkoutService = {
  getAddresses: () =>
    axiosInstance
      .get<ApiResponse<Address[]>>('/addresses')
      .then((r) => r.data.data),

  createOrder: (payload: CreateOrderPayload) =>
    axiosInstance
      .post<ApiResponse<{ id: number }>>('/orders/checkout', payload)
      .then((r) => r.data.data),
};
