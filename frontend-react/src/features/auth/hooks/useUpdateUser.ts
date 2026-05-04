import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { UpdateUserPayload } from '../types/user.types';
import { USERS_QUERY_KEY } from './useUsers';

export const useUpdateUser = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserPayload) => userService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
};
