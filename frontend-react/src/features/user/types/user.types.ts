export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  roleId: number;
  role?: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  roleId: number;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  fullName?: string;
  roleId?: number;
  phone?: string;
  isActive?: boolean;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
