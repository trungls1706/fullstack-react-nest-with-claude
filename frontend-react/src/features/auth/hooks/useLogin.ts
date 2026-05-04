import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import type { LoginPayload } from '../types/auth.types';

export const useLogin = () => {
  const setLoginData = useAuthStore((s) => s.setLoginData);

  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await authService.login(data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setLoginData(data);
    },
  });
};
