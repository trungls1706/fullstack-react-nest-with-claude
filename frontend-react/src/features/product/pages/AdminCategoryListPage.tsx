import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useCategories } from '../hooks/useCategories';
import { CategoryList } from '../components/CategoryList';

export const AdminCategoryListPage = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading, isError } = useCategories();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => navigate(ROUTES.ADMIN_CATEGORY_CREATE)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Category
        </button>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      )}

      {isError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load categories. Please try again.
        </div>
      )}

      {categories && <CategoryList categories={categories} />}
    </div>
  );
};
