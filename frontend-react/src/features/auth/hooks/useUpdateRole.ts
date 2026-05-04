import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/role.service';
import type { UpdateRolePayload } from '../types/role.types';
import { ROLES_QUERY_KEY } from './useRoles';

export const useUpdateRole = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRolePayload) => roleService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'roles', id] });
    },
  });
};
