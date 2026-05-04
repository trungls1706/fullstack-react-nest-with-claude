import axiosInstance from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserQueryParams,
} from '../types/user.types';

export const userService = {
  getAll: (params?: UserQueryParams) =>
    axiosInstance.get<PaginatedResponse<User>>('/admin/users', { params }),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<User>>(`/admin/users/${id}`),

  create: (data: CreateUserPayload) =>
    axiosInstance.post<ApiResponse<User>>('/admin/users', data),

  update: (id: number, data: UpdateUserPayload) =>
    axiosInstance.patch<ApiResponse<User>>(`/admin/users/${id}`, data),

  toggleActive: (id: number) =>
    axiosInstance.patch<ApiResponse<User>>(`/admin/users/${id}/toggle-active`),

  delete: (id: number) =>
    axiosInstance.delete<void>(`/admin/users/${id}`),
};
