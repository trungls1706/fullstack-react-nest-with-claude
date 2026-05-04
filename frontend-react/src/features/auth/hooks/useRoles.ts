import { useQuery } from '@tanstack/react-query';
import { roleService } from '../services/role.service';

export const ROLES_QUERY_KEY = ['admin', 'roles'] as const;

export const useRoles = () => {
  return useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: async () => {
      const res = await roleService.getAll();
      return res.data.data;
    },
  });
};
