import { axiosInstance } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  UpdateMePayload,
} from '../types/auth.types';

export const authService = {
  register: (payload: RegisterPayload) =>
    axiosInstance
      .post<ApiResponse<AuthUser>>('/auth/register', payload)
      .then((r) => r.data),

  login: (payload: LoginPayload) =>
    axiosInstance
      .post<ApiResponse<LoginResponse>>('/auth/login', payload)
      .then((r) => r.data),

  logout: () =>
    axiosInstance.post<void>('/auth/logout').then(() => undefined),

  me: () =>
    axiosInstance.get<ApiResponse<AuthUser>>('/auth/me').then((r) => r.data),

  updateMe: (payload: UpdateMePayload) =>
    axiosInstance
      .patch<ApiResponse<AuthUser>>('/auth/me', payload)
      .then((r) => r.data),

  changePassword: (payload: ChangePasswordPayload) =>
    axiosInstance
      .patch<void>('/auth/change-password', payload)
      .then(() => undefined),
};
