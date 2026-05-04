import { useQuery } from '@tanstack/react-query';
import { roleService } from '../services/role.service';

export const useRole = (id: number) => {
  return useQuery({
    queryKey: ['admin', 'roles', id],
    queryFn: async () => {
      const res = await roleService.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
};
