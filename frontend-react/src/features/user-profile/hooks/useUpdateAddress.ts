import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../services/address.service';
import { ADDRESSES_QUERY_KEY } from './useAddresses';
import type { UpdateAddressPayload } from '../types/user-profile.types';

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAddressPayload }) =>
      addressService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
};
