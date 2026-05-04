import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export const productQueryKey = (slug: string) =>
  ['products', 'detail', slug] as const;

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: productQueryKey(slug),
    queryFn: async () => {
      const res = await productService.getBySlug(slug);
      return res.data.data;
    },
    enabled: !!slug,
  });
};
