import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type {
  CreateUserPayload,
  ListUsersParams,
  UpdateUserPayload,
} from '../types/user.types';

const USERS_KEY = ['admin', 'users'] as const;

export const useUsers = (params: ListUsersParams = {}) =>
  useQuery({
    queryKey: [...USERS_KEY, params],
    queryFn: () => userService.list(params),
  });

export const useUser = (id: number | undefined) =>
  useQuery({
    queryKey: [...USERS_KEY, id],
    queryFn: () => userService.getById(id as number),
    enabled: typeof id === 'number',
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; payload: UpdateUserPayload }) =>
      userService.update(vars.id, vars.payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      qc.invalidateQueries({ queryKey: [...USERS_KEY, vars.id] });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
};
