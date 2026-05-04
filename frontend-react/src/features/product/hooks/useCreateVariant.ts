import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { CreateVariantPayload } from '../types/product.types';
import { productVariantsQueryKey } from './useProductVariants';

export const useCreateVariant = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVariantPayload) =>
      productService.createVariant(productId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productVariantsQueryKey(productId),
      });
    },
  });
};
