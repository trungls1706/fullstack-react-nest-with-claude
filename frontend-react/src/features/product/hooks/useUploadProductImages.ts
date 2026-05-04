import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export const useUploadProductImages = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) =>
      productService.uploadImages(productId, files),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['products', 'detail'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'products'],
      });
    },
  });
};
