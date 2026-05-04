import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

export const useCategories = () => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const res = await categoryService.getAll();
      return res.data.data;
    },
  });
};
