import axiosInstance from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  RegisterPayload,
  RegisterResponse,
  UpdateProfilePayload,
} from '../types/auth.types';

export const authService = {
  register: (data: RegisterPayload) =>
    axiosInstance.post<ApiResponse<RegisterResponse>>('/auth/register', data),

  login: (data: LoginPayload) =>
    axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', data),

  refresh: () =>
    axiosInstance.post<ApiResponse<RefreshResponse>>('/auth/refresh'),

  logout: () =>
    axiosInstance.post<void>('/auth/logout'),

  me: () =>
    axiosInstance.get<ApiResponse<AuthUser>>('/auth/me'),

  updateProfile: (data: UpdateProfilePayload) =>
    axiosInstance.patch<ApiResponse<Partial<AuthUser>>>('/auth/me', data),

  changePassword: (data: ChangePasswordPayload) =>
    axiosInstance.patch<void>('/auth/change-password', data),
};
