import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../services/address.service';
import { ADDRESSES_QUERY_KEY } from './useAddresses';

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => addressService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
};
