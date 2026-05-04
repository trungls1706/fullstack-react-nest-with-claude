import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { formatPrice } from '@/shared/utils/format';
import { useRemoveCartItem } from '../hooks/useRemoveCartItem';
import { useUpdateCartItem } from '../hooks/useUpdateCartItem';
import type { CartItem } from '../types/cart.types';

interface Props {
  item: CartItem;
}

export const CartItemRow = ({ item }: Props) => {
  const navigate = useNavigate();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();

  const variant = item.productVariant;
  const product = variant?.product;
  const effectivePrice = variant?.salePrice ?? variant?.price ?? 0;

  const handleQtyChange = (newQty: number) => {
    if (newQty < 1) return;
    updateItem({ itemId: item.id, data: { quantity: newQty } });
  };

  return (
    <div className="flex items-start gap-4 py-4">
      {/* Thumbnail */}
      <div
        className="h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md bg-gray-100"
        onClick={() =>
          product &&
          navigate(ROUTES.PRODUCT_DETAIL.replace(':slug', product.slug))
        }
      >
        {product?.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1">
        <p
          className="cursor-pointer text-sm font-medium text-gray-900 hover:text-indigo-600"
          onClick={() =>
            product &&
            navigate(ROUTES.PRODUCT_DETAIL.replace(':slug', product.slug))
          }
        >
          {product?.name ?? 'Product'}
        </p>
        {(variant?.color || variant?.size) && (
          <p className="text-xs text-gray-500">
            {[variant.color, variant.size].filter(Boolean).join(' / ')}
          </p>
        )}
        <p className="text-sm font-semibold text-indigo-600">
          {formatPrice(effectivePrice)}
        </p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQtyChange(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <button
          onClick={() => handleQtyChange(item.quantity + 1)}
          disabled={isUpdating}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          +
        </button>
      </div>

      {/* Line total */}
      <p className="w-24 text-right text-sm font-semibold text-gray-900">
        {formatPrice(effectivePrice * item.quantity)}
      </p>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.id)}
        disabled={isRemoving}
        className="text-gray-400 hover:text-red-500 disabled:opacity-40"
        title="Remove item"
      >
        ✕
      </button>
    </div>
  );
};
