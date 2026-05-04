import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/role.service';
import type { CreateRolePayload } from '../types/role.types';
import { ROLES_QUERY_KEY } from './useRoles';

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRolePayload) => roleService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
};
