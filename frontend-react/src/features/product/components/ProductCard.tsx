import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { formatPrice } from '@/shared/utils/format';
import type { Product } from '../types/product.types';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();

  const minPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => v.salePrice ?? v.price))
    : null;

  return (
    <div
      onClick={() =>
        navigate(ROUTES.PRODUCT_DETAIL.replace(':slug', product.slug))
      }
      className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate text-sm font-medium text-gray-900">
          {product.name}
        </h3>
        {product.category && (
          <p className="mt-1 text-xs text-gray-500">{product.category.name}</p>
        )}
        {minPrice !== null && (
          <p className="mt-2 text-sm font-semibold text-indigo-600">
            {formatPrice(minPrice)}
          </p>
        )}
      </div>
    </div>
  );
};
