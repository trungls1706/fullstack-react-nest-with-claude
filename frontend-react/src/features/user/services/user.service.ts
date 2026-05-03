import { axiosInstance } from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type {
  CreateUserPayload,
  ListUsersParams,
  UpdateUserPayload,
  User,
} from '../types/user.types';

export const userService = {
  list: (params: ListUsersParams = {}) =>
    axiosInstance
      .get<PaginatedResponse<User>>('/admin/users', { params })
      .then((r) => r.data),

  getById: (id: number) =>
    axiosInstance
      .get<ApiResponse<User>>(`/admin/users/${id}`)
      .then((r) => r.data),

  create: (payload: CreateUserPayload) =>
    axiosInstance
      .post<ApiResponse<User>>('/admin/users', payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateUserPayload) =>
    axiosInstance
      .patch<ApiResponse<User>>(`/admin/users/${id}`, payload)
      .then((r) => r.data),

  remove: (id: number) =>
    axiosInstance.delete<void>(`/admin/users/${id}`).then(() => undefined),
};
