import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { ProductQueryParams } from '../types/product.types';

export const adminProductsQueryKey = (params?: ProductQueryParams) =>
  ['admin', 'products', params] as const;

export const useAdminProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: adminProductsQueryKey(params),
    queryFn: async () => {
      const res = await productService.adminGetAll(params);
      return res.data.data;
    },
  });
};
