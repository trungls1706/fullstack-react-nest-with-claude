import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useCategories } from '../hooks/useCategories';
import { useCreateProduct } from '../hooks/useCreateProduct';
import { ProductForm } from '../components/ProductForm';

export const AdminProductCreatePage = () => {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { mutate: createProduct, isPending } = useCreateProduct();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProductForm
          categories={categories}
          isLoading={isPending}
          onSubmit={(values) => {
            createProduct(
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
