import axiosInstance from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  AddToCartPayload,
  Cart,
  CartItem,
  UpdateCartItemPayload,
} from '../types/cart.types';

export const cartService = {
  getCart: () =>
    axiosInstance.get<ApiResponse<Cart>>('/cart'),

  addItem: (data: AddToCartPayload) =>
    axiosInstance.post<ApiResponse<CartItem>>('/cart/items', data),

  updateItem: (itemId: number, data: UpdateCartItemPayload) =>
    axiosInstance.patch<ApiResponse<CartItem>>(`/cart/items/${itemId}`, data),

  removeItem: (itemId: number) =>
    axiosInstance.delete<void>(`/cart/items/${itemId}`),

  clearCart: () =>
    axiosInstance.delete<void>('/cart'),

  mergeCart: () =>
    axiosInstance.post<ApiResponse<Cart>>('/cart/merge'),
};
