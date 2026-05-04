import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateMePayload,
} from '../types/auth.types';

const ME_KEY = ['auth', 'me'] as const;

export const useMe = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      const res = await authService.me();
      setUser(res.data);
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};

export const useLogin = () => {
  const setSession = useAuthStore((s) => s.setSession);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (res) => {
      setSession(res.data.accessToken, res.data.user);
      qc.setQueryData(ME_KEY, res.data.user);
    },
  });
};

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  });

export const useLogout = () => {
  const clear = useAuthStore((s) => s.clear);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clear();
      qc.clear();
    },
  });
};

export const useUpdateMe = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMePayload) => authService.updateMe(payload),
    onSuccess: (res) => {
      setUser(res.data);
      qc.setQueryData(ME_KEY, res.data);
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authService.changePassword(payload),
  });
