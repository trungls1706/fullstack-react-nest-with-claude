import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useDeleteCategory } from '../hooks/useDeleteCategory';
import type { Category } from '../types/product.types';

interface Props {
  categories: Category[];
}

export const CategoryList = ({ categories }: Props) => {
  const navigate = useNavigate();
  const { mutate: deleteCategory, isPending } = useDeleteCategory();

  const handleDelete = (category: Category) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    deleteCategory(category.id);
  };

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No categories found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Slug
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Parent
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-500">
                {category.id}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {category.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {category.slug}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {category.parentId ?? '—'}
              </td>
              <td className="px-6 py-4 text-right text-sm">
                <button
                  onClick={() =>
                    navigate(
                      ROUTES.ADMIN_CATEGORY_EDIT.replace(
                        ':id',
                        String(category.id),
                      ),
                    )
                  }
                  className="mr-3 text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
