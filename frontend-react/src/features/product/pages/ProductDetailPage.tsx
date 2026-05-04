import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useAddToCart } from '@/features/cart/hooks/useAddToCart';
import { useCartStore } from '@/features/cart/stores/cart.store';
import { ReviewList } from '@/features/review/components/ReviewList';
import { useProduct } from '../hooks/useProduct';
import { useProductVariants } from '../hooks/useProductVariants';
import { ProductImageGallery } from '../components/ProductImageGallery';
import { VariantSelector } from '../components/VariantSelector';
import type { ProductVariant } from '../types/product.types';

export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(slug!);
  const { data: variants = [] } = useProductVariants(product?.id ?? 0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const currentUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const incrementCount = useCartStore((s) => s.incrementCount);
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!selectedVariant) return;

    addToCart(
      { productVariantId: selectedVariant.id, quantity },
      {
        onSuccess: () => {
          incrementCount(quantity);
          setAddedFeedback(true);
          setTimeout(() => setAddedFeedback(false), 2000);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg bg-gray-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Product not found.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductImageGallery
          images={product.images ?? []}
          thumbnailUrl={product.thumbnailUrl}
        />

        <div className="space-y-6">
          {product.category && (
            <p className="text-sm text-gray-500">{product.category.name}</p>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

          {product.description && (
            <p className="text-gray-600">{product.description}</p>
          )}

          {variants.length > 0 && (
            <div>
              <h2 className="mb-3 text-base font-semibold text-gray-900">
                Select Variant
              </h2>
              <VariantSelector
                variants={variants}
                onSelect={setSelectedVariant}
              />
            </div>
          )}

          {/* Quantity selector */}
          {selectedVariant && selectedVariant.stockQuantity > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition hover:bg-gray-50"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(selectedVariant.stockQuantity, q + 1),
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            id="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={
              !selectedVariant ||
              selectedVariant.stockQuantity === 0 ||
              isAdding
            }
            className={`w-full rounded-md px-6 py-3 text-base font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              addedFeedback
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isAdding
              ? 'Adding...'
              : addedFeedback
                ? '✓ Added to Cart!'
                : !selectedVariant
                  ? 'Select a variant'
                  : selectedVariant.stockQuantity === 0
                    ? 'Out of Stock'
                    : !isAuthenticated
                      ? 'Sign in to Add to Cart'
                      : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 border-t border-gray-200 pt-10">
        <ReviewList
          productId={product.id}
          currentUserId={currentUser?.id}
        />
      </div>
    </div>
  );
};
