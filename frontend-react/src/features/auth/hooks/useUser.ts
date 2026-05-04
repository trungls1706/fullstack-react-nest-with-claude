import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const res = await userService.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
};
