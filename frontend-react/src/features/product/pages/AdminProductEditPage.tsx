import { useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useAdminProduct } from '../hooks/useAdminProduct';
import { useCategories } from '../hooks/useCategories';
import { useUpdateProduct } from '../hooks/useUpdateProduct';
import { ProductForm } from '../components/ProductForm';

export const AdminProductEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: product, isLoading, isError } = useAdminProduct(productId);
  const { data: categories = [] } = useCategories();
  const { mutate: updateProduct, isPending } = useUpdateProduct(productId);

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>;
  }

  if (isError || !product) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        Product not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProductForm
          defaultValues={product}
          categories={categories}
          isLoading={isPending}
          onSubmit={(values) => {
            updateProduct(
              {
                ...values,
                thumbnailUrl: values.thumbnailUrl || undefined,
                description: values.description || undefined,
              },
              {
                onSuccess: () => navigate(ROUTES.ADMIN_PRODUCTS),
              },
            );
          }}
        />
      </div>
    </div>
  );
};
