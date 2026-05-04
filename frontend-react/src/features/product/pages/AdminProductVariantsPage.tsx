import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { useProductVariants } from '../hooks/useProductVariants';
import { useCreateVariant } from '../hooks/useCreateVariant';
import { useUpdateVariant } from '../hooks/useUpdateVariant';
import { VariantList } from '../components/VariantList';
import { VariantForm } from '../components/VariantForm';
import { ProductImageManager } from '../components/ProductImageManager';
import type { ProductVariant } from '../types/product.types';

export const AdminProductVariantsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: productsData } = useAdminProducts();
  const {
    data: variants = [],
    isLoading: isVariantsLoading,
  } = useProductVariants(productId);

  const { mutate: createVariant, isPending: isCreating } =
    useCreateVariant(productId);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );
  const { mutate: updateVariant, isPending: isUpdating } = useUpdateVariant(
    productId,
    editingVariant?.id ?? 0,
  );

  const product = productsData?.data.find((p) => p.id === productId);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {product ? `${product.name} — Variants` : 'Product Variants'}
          </h1>
          {product && (
            <p className="text-sm text-gray-500">ID: {productId}</p>
          )}
        </div>
      </div>

      {/* Variants section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {editingVariant ? 'Edit Variant' : 'Add Variant'}
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <VariantForm
            defaultValues={editingVariant ?? undefined}
            isLoading={isCreating || isUpdating}
            onSubmit={(values) => {
              if (editingVariant) {
                updateVariant(values, {
                  onSuccess: () => setEditingVariant(null),
                });
              } else {
                createVariant(values);
              }
            }}
          />
          {editingVariant && (
            <button
              onClick={() => setEditingVariant(null)}
              className="mt-3 w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Variants ({variants.length})
        </h2>
        {isVariantsLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : (
          <VariantList variants={variants} onEdit={setEditingVariant} />
        )}
      </section>

      {/* Images section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Images</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <ProductImageManager
            productId={productId}
            images={product?.images ?? []}
          />
        </div>
      </section>
    </div>
  );
};
