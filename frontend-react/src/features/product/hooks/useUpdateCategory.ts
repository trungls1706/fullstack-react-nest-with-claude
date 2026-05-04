import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';
import type { UpdateCategoryPayload } from '../types/product.types';
import { CATEGORIES_QUERY_KEY } from './useCategories';

export const useUpdateCategory = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryPayload) =>
      categoryService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};
