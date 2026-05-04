export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Actual backend response body for paginated endpoints:
// TransformInterceptor wraps paginate() result → { success, data: { data: T[], meta } }
export interface PaginatedResponse<T> {
  success: boolean;
  data: PaginatedData<T>;
}

// The unwrapped paginated payload (what hooks return after r.data.data)
export interface PaginatedData<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
