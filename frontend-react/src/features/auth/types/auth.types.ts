export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Pick<AuthUser, 'id' | 'email' | 'fullName' | 'role'>;
}

export interface RegisterResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface RefreshResponse {
  accessToken: string;
}
