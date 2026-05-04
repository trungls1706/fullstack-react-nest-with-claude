import { AxiosError } from 'axios';

/**
 * Extract a user-friendly error message from an API error.
 *
 * Backend returns errors in the shape:
 *   { success: false, error: { code: string, message: string, details?: {...} } }
 *
 * Axios wraps them in AxiosError with response.data containing that shape.
 */
export const extractApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Try to get the backend error message
    const data = error.response?.data as
      | { error?: { message?: string }; message?: string | string[] }
      | undefined;

    // NestJS standard: { error: { message: "..." } }
    if (data?.error?.message) {
      return data.error.message;
    }

    // NestJS validation pipe: { message: ["error1", "error2"] }
    if (Array.isArray(data?.message)) {
      return data.message.join('. ');
    }

    // NestJS simple: { message: "..." }
    if (typeof data?.message === 'string') {
      return data.message;
    }

    // HTTP status text fallback
    if (error.response?.statusText) {
      return `${error.response.status}: ${error.response.statusText}`;
    }

    // Network error
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot connect to the server. Please check your connection.';
    }
  }

  // Generic Error
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
