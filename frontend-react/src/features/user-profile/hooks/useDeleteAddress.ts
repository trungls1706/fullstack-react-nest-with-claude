import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../services/address.service';
import { ADDRESSES_QUERY_KEY } from './useAddresses';

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => addressService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
};
