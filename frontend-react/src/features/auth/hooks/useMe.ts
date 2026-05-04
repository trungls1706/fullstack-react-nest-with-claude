import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

export const ME_QUERY_KEY = ['auth', 'me'] as const;

export const useMe = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const res = await authService.me();
      return res.data.data;
    },
    enabled: isAuthenticated,
  });
};
