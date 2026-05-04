import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { CreateProductPayload } from '../types/product.types';
import { adminProductsQueryKey } from './useAdminProducts';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductPayload) => productService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminProductsQueryKey(),
      });
    },
  });
};
