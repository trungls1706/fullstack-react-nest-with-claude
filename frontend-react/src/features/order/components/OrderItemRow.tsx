import { formatPrice } from '@/shared/utils/format';
import type { OrderItem } from '../types/order.types';

interface Props {
  item: OrderItem;
}

export const OrderItemRow = ({ item }: Props) => {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-medium text-gray-900">{item.productName}</p>
        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
        <p className="text-sm text-indigo-600">{formatPrice(item.price)}</p>
      </div>

      <div className="text-right">
        <p className="text-sm text-gray-500">×{item.quantity}</p>
        <p className="text-sm font-semibold text-gray-900">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
};
