import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';

export const useCategoryQueryKey = (slug: string) =>
  ['categories', slug] as const;

export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: useCategoryQueryKey(slug),
    queryFn: async () => {
      const res = await categoryService.getBySlug(slug);
      return res.data.data;
    },
    enabled: !!slug,
  });
};
