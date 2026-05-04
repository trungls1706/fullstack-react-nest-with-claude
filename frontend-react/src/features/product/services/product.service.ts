import axiosInstance from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type {
  CreateProductPayload,
  CreateVariantPayload,
  Product,
  ProductImage,
  ProductQueryParams,
  ProductVariant,
  UpdateProductPayload,
  UpdateVariantPayload,
} from '../types/product.types';

export const productService = {
  // ─── Public ────────────────────────────────────────────────────────────────

  getAll: (params?: ProductQueryParams) =>
    axiosInstance.get<PaginatedResponse<Product>>('/products', { params }),

  getBySlug: (slug: string) =>
    axiosInstance.get<ApiResponse<Product>>(`/products/${slug}`),

  getVariants: (productId: number) =>
    axiosInstance.get<ApiResponse<ProductVariant[]>>(
      `/products/${productId}/variants`,
    ),

  getVariantById: (variantId: number) =>
    axiosInstance.get<ApiResponse<ProductVariant>>(`/variants/${variantId}`),

  // ─── Admin Products ────────────────────────────────────────────────────────

  adminGetAll: (params?: ProductQueryParams) =>
    axiosInstance.get<PaginatedResponse<Product>>('/admin/products', { params }),

  adminGetById: (id: number) =>
    axiosInstance.get<ApiResponse<Product>>(`/admin/products/${id}`),

  create: (data: CreateProductPayload) =>
    axiosInstance.post<ApiResponse<Product>>('/admin/products', data),

  update: (id: number, data: UpdateProductPayload) =>
    axiosInstance.patch<ApiResponse<Product>>(`/admin/products/${id}`, data),

  delete: (id: number) =>
    axiosInstance.delete<void>(`/admin/products/${id}`),

  // ─── Admin Variants ────────────────────────────────────────────────────────

  createVariant: (productId: number, data: CreateVariantPayload) =>
    axiosInstance.post<ApiResponse<ProductVariant>>(
      `/admin/products/${productId}/variants`,
      data,
    ),

  updateVariant: (variantId: number, data: UpdateVariantPayload) =>
    axiosInstance.patch<ApiResponse<ProductVariant>>(
      `/admin/variants/${variantId}`,
      data,
    ),

  // ─── Admin Images ──────────────────────────────────────────────────────────

  uploadImages: (productId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return axiosInstance.post<ApiResponse<ProductImage[]>>(
      `/admin/products/${productId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  deleteImage: (imageId: number) =>
    axiosInstance.delete<void>(`/admin/images/${imageId}`),
};
