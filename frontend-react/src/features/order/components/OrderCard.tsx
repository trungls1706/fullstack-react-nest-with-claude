import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { formatPrice } from '@/shared/utils/format';
import type { OrderListItem } from '../types/order.types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface Props {
  order: OrderListItem;
}

export const OrderCard = ({ order }: Props) => {
  const navigate = useNavigate();

  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;

  return (
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
      onClick={() =>
        navigate(ROUTES.ORDER_DETAIL.replace(':id', String(order.id)))
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">
          Order #{order.id}
        </span>
        <OrderStatusBadge status={order.status} />
      </div>

      {firstItem && (
        <div className="mb-3 flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
            {firstItem.thumbnailUrl ? (
              <img
                src={firstItem.thumbnailUrl}
                alt={firstItem.productName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-200" />
            )}
          </div>
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-medium">{firstItem.productName}</p>
            {extraCount > 0 && (
              <p className="text-gray-400">+{extraCount} more item(s)</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
        <span className="text-gray-500">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
        <span className="font-semibold text-gray-900">
          {formatPrice(order.totalAmount)}
        </span>
      </div>
    </div>
  );
};
