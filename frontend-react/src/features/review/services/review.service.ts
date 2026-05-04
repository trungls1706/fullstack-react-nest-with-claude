import axiosInstance from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import type {
  Review,
  CreateReviewPayload,
  UpdateReviewPayload,
} from '../types/review.types';

export const reviewService = {
  getByProduct: (productId: number) =>
    axiosInstance
      .get<PaginatedResponse<Review>>(`/products/${productId}/reviews`)
      .then((r) => r.data.data),

  create: (productId: number, data: CreateReviewPayload) =>
    axiosInstance
      .post<ApiResponse<Review>>(`/products/${productId}/reviews`, data)
      .then((r) => r.data.data),

  update: (reviewId: number, data: UpdateReviewPayload) =>
    axiosInstance
      .patch<ApiResponse<Review>>(`/reviews/${reviewId}`, data)
      .then((r) => r.data.data),

  delete: (reviewId: number) =>
    axiosInstance.delete<void>(`/reviews/${reviewId}`).then((r) => r.data),
};
