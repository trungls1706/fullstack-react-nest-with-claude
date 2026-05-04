import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import type { ProductQueryParams } from '../types/product.types';

export const productsQueryKey = (params?: ProductQueryParams) =>
  ['products', params] as const;

export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: productsQueryKey(params),
    queryFn: async () => {
      const res = await productService.getAll(params);
      return res.data.data;
    },
  });
};
