import { useParams } from 'react-router';
import { useCategory } from '../hooks/useCategory';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: isCategoryLoading } = useCategory(slug!);
  const { data: productsData, isLoading: isProductsLoading } = useProducts({
    categoryId: category?.id,
    isActive: true,
  });

  const isLoading = isCategoryLoading || isProductsLoading;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {isLoading ? (
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      ) : (
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          {category?.name ?? 'Category'}
        </h1>
      )}

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

      {!isLoading && productsData?.data.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No products in this category.
        </div>
      )}

      {productsData && productsData.data.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {productsData.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
