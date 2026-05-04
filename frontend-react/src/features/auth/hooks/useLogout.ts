import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      void navigate(ROUTES.LOGIN);
    },
  });
};
