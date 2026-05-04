import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { UpdateVariantPayload } from '../types/product.types';

export const useUpdateVariant = (productId: number, variantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateVariantPayload) =>
      productService.updateVariant(variantId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['products', productId, 'variants'],
      });
    },
  });
};
