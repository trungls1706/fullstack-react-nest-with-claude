import axiosInstance from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/product.types';

export const categoryService = {
  getAll: () =>
    axiosInstance.get<ApiResponse<Category[]>>('/categories'),

  getBySlug: (slug: string) =>
    axiosInstance.get<ApiResponse<Category>>(`/categories/${slug}`),

  create: (data: CreateCategoryPayload) =>
    axiosInstance.post<ApiResponse<Category>>('/admin/categories', data),

  update: (id: number, data: UpdateCategoryPayload) =>
    axiosInstance.patch<ApiResponse<Category>>(`/admin/categories/${id}`, data),

  delete: (id: number) =>
    axiosInstance.delete<void>(`/admin/categories/${id}`),
};
