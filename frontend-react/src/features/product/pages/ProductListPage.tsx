import { useSearchParams } from 'react-router';
import { PAGINATION_DEFAULTS } from '@/config/constants';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import type { ProductQueryParams } from '../types/product.types';

export const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: ProductQueryParams = {
    page: Number(searchParams.get('page') ?? PAGINATION_DEFAULTS.PAGE),
    limit: Number(searchParams.get('limit') ?? PAGINATION_DEFAULTS.LIMIT),
    categoryId: searchParams.get('category_id')
      ? Number(searchParams.get('category_id'))
      : undefined,
    isActive: true,
  };

  const { data, isLoading, isError } = useProducts(params);

  const goToPage = (page: number) => {
    setSearchParams((prev) => {
      prev.set('page', String(page));
      return prev;
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Products</h1>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load products. Please try again.
        </div>
      )}

      {data && (
        <>
          {data.data.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {data.meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(data.meta.page - 1)}
                disabled={data.meta.page <= 1}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <button
                onClick={() => goToPage(data.meta.page + 1)}
                disabled={data.meta.page >= data.meta.totalPages}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
