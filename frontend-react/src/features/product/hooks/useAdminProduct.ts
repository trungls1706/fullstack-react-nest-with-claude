import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export const adminProductQueryKey = (id: number) =>
  ['admin', 'product', id] as const;

export const useAdminProduct = (id: number) => {
  return useQuery({
    queryKey: adminProductQueryKey(id),
    queryFn: async () => {
      const res = await productService.adminGetById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
};
