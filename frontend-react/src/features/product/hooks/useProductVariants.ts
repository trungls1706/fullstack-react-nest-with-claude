import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export const productVariantsQueryKey = (productId: number) =>
  ['products', productId, 'variants'] as const;

export const useProductVariants = (productId: number) => {
  return useQuery({
    queryKey: productVariantsQueryKey(productId),
    queryFn: async () => {
      const res = await productService.getVariants(productId);
      return res.data.data;
    },
    enabled: !!productId,
  });
};
