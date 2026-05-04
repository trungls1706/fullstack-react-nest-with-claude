import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { UserQueryParams } from '../types/user.types';

export const USERS_QUERY_KEY = ['admin', 'users'] as const;

export const useUsers = (params?: UserQueryParams) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await userService.getAll(params);
      return res.data.data;
    },
  });
};
