import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { UpdateProductPayload } from '../types/product.types';

export const useUpdateProduct = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductPayload) =>
      productService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'products'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'products', id],
      });
    },
  });
};
