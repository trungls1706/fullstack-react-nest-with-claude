import { useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useCategories } from '../hooks/useCategories';
import { useUpdateCategory } from '../hooks/useUpdateCategory';
import { CategoryForm } from '../components/CategoryForm';

export const AdminCategoryEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);

  const { data: categories = [], isLoading, isError } = useCategories();
  const { mutate: updateCategory, isPending } = useUpdateCategory(categoryId);

  const category = categories.find((c) => Number(c.id) === categoryId);

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>;
  }

  if (isError || !category) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        Category not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.ADMIN_CATEGORIES)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <CategoryForm
          defaultValues={category}
          categories={categories}
          isLoading={isPending}
          onSubmit={(values) => {
            updateCategory(values, {
              onSuccess: () => navigate(ROUTES.ADMIN_CATEGORIES),
            });
          }}
        />
      </div>
    </div>
  );
};
