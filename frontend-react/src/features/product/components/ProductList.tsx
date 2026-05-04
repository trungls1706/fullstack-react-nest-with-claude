import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
import type { Product } from '../types/product.types';

interface Props {
  products: Product[];
}

export const ProductList = ({ products }: Props) => {
  const navigate = useNavigate();
  const { mutate: deleteProduct, isPending } = useDeleteProduct();

  const handleDelete = (product: Product) => {
    if (!confirm(`Delete product "${product.name}"?`)) return;
    deleteProduct(product.id);
  };

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">No products found.</div>
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
              Thumbnail
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-500">{product.id}</td>
              <td className="px-6 py-4">
                {product.thumbnailUrl ? (
                  <img
                    src={product.thumbnailUrl}
                    alt={product.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-gray-100" />
                )}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {product.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {product.category?.name ?? '—'}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    product.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm">
                <button
                  onClick={() =>
                    navigate(
                      ROUTES.ADMIN_PRODUCT_VARIANTS.replace(
                        ':id',
                        String(product.id),
                      ),
                    )
                  }
                  className="mr-3 text-gray-600 hover:text-gray-900"
                >
                  Variants
                </button>
                <button
                  onClick={() =>
                    navigate(
                      ROUTES.ADMIN_PRODUCT_EDIT.replace(
                        ':id',
                        String(product.id),
                      ),
                    )
                  }
                  className="mr-3 text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product)}
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
