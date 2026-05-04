import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/role.service';
import { ROLES_QUERY_KEY } from './useRoles';

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roleService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
};
