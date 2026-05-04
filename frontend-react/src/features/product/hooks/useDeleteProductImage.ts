import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export const useDeleteProductImage = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: number) => productService.deleteImage(imageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['products', 'detail'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'products', productId],
      });
    },
  });
};
