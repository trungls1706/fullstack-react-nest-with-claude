import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../services/address.service';
import { ADDRESSES_QUERY_KEY } from './useAddresses';
import type { CreateAddressPayload } from '../types/user-profile.types';

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressPayload) => addressService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
};
