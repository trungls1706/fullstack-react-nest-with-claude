import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';
import { CATEGORIES_QUERY_KEY } from './useCategories';

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};
