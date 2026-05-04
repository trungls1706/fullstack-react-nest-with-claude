import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import type { RegisterPayload } from '../types/auth.types';

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterPayload) => {
      const res = await authService.register(data);
      return res.data.data;
    },
  });
};
