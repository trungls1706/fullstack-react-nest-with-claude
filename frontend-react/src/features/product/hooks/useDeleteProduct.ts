import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      alert('Product deleted successfully');
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'products'],
      });
    },
    onError: (err) => {
      alert('Failed to delete product: ' + err.message);
    },
  });
};
