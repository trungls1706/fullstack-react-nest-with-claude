import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { USERS_QUERY_KEY } from './useUsers';

export const useToggleUserActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.toggleActive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};
