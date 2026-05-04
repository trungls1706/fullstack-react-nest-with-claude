import { useQuery } from '@tanstack/react-query';
import { addressService } from '../services/address.service';

export const ADDRESSES_QUERY_KEY = ['addresses'] as const;

export const useAddresses = () => {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: () => addressService.getAll(),
  });
};
