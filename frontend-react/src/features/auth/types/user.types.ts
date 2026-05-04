export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  roleId: number;
  role?: { id: number; name: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roleId: number;
}

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;
  roleId?: number;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}
