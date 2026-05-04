import axiosInstance from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CreateRolePayload, Role, UpdateRolePayload } from '../types/role.types';

export const roleService = {
  getAll: () =>
    axiosInstance.get<ApiResponse<Role[]>>('/admin/roles'),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<Role>>(`/admin/roles/${id}`),

  create: (data: CreateRolePayload) =>
    axiosInstance.post<ApiResponse<Role>>('/admin/roles', data),

  update: (id: number, data: UpdateRolePayload) =>
    axiosInstance.put<ApiResponse<Role>>(`/admin/roles/${id}`, data),

  delete: (id: number) =>
    axiosInstance.delete<void>(`/admin/roles/${id}`),
};
