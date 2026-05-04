import { useNavigate, useParams } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { formatPrice } from '@/shared/utils/format';
import { useOrder } from '../hooks/useOrder';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderItemRow } from '../components/OrderItemRow';

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = Number(id);
  const { data: order, isLoading, isError } = useOrder(orderId);
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Order not found.
        </div>
      </div>
    );
  }

  const canCancel = order.status === 'pending' || order.status === 'confirmed';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate(ROUTES.ORDERS)}
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        ← Back to orders
      </button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white px-6">
        <h2 className="py-4 text-base font-semibold text-gray-900">Items</h2>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Shipping address */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Shipping Address
          </h2>
          <p className="text-sm text-gray-700">
            {order.shippingAddress.fullName}
          </p>
          <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
          <p className="text-sm text-gray-500">
            {order.shippingAddress.addressLine}, {order.shippingAddress.city}
          </p>
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Order Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Payment</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payment status</span>
              <span
                className={
                  order.paymentStatus === 'paid'
                    ? 'text-green-600'
                    : 'text-orange-500'
                }
              >
                {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping fee</span>
              <span>{formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {canCancel && (
        <div className="mt-6">
          <button
            onClick={() => {
              if (!confirm('Cancel this order?')) return;
              cancelOrder(order.id, {
                onSuccess: () => navigate(ROUTES.ORDERS),
              });
            }}
            disabled={isCancelling}
            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
};
