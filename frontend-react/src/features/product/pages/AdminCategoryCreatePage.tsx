import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useCategories } from '../hooks/useCategories';
import { useCreateCategory } from '../hooks/useCreateCategory';
import { CategoryForm } from '../components/CategoryForm';

export const AdminCategoryCreatePage = () => {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { mutate: createCategory, isPending } = useCreateCategory();

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.ADMIN_CATEGORIES)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Category</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <CategoryForm
          categories={categories}
          isLoading={isPending}
          onSubmit={(values) => {
            createCategory(values, {
              onSuccess: () => navigate(ROUTES.ADMIN_CATEGORIES),
            });
          }}
        />
      </div>
    </div>
  );
};
