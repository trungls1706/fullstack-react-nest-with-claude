import { AxiosError } from 'axios';
import type { ApiError } from '@/shared/types/api.types';

export const extractApiError = (err: unknown, fallback = 'Something went wrong'): string => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiError | { message?: string } | undefined;
    if (data && 'error' in data && data.error?.message) return data.error.message;
    if (data && 'message' in data && data.message) return data.message;
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};
