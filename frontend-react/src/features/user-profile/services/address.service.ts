import axiosInstance from '@/shared/lib/axios';
import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from '../types/user-profile.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const addressService = {
  getAll: () =>
    axiosInstance
      .get<ApiResponse<Address[]>>('/addresses')
      .then((r) => r.data.data),

  getById: (id: number) =>
    axiosInstance
      .get<ApiResponse<Address>>(`/addresses/${id}`)
      .then((r) => r.data.data),

  create: (data: CreateAddressPayload) =>
    axiosInstance
      .post<ApiResponse<Address>>('/addresses', data)
      .then((r) => r.data.data),

  update: (id: number, data: UpdateAddressPayload) =>
    axiosInstance
      .patch<ApiResponse<Address>>(`/addresses/${id}`, data)
      .then((r) => r.data.data),

  delete: (id: number) =>
    axiosInstance.delete<void>(`/addresses/${id}`).then((r) => r.data),

  setDefault: (id: number) =>
    axiosInstance
      .patch<ApiResponse<Address>>(`/addresses/${id}/default`)
      .then((r) => r.data.data),
};
