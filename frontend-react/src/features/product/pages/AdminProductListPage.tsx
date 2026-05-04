import { useNavigate, useSearchParams } from 'react-router';
import { PAGINATION_DEFAULTS } from '@/config/constants';
import { ROUTES } from '@/routes/routes';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { ProductList } from '../components/ProductList';

export const AdminProductListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? PAGINATION_DEFAULTS.PAGE);
  const limit = Number(searchParams.get('limit') ?? PAGINATION_DEFAULTS.LIMIT);

  const { data, isLoading, isError } = useAdminProducts({ page, limit });

  const goToPage = (nextPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', String(nextPage));
      return prev;
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => navigate(ROUTES.ADMIN_PRODUCT_CREATE)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Product
        </button>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      )}

      {isError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load products. Please try again.
        </div>
      )}

      {data && (
        <>
          <ProductList products={data.data} />

          {data.meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
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
