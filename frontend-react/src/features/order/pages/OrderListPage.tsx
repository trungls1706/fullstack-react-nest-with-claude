import { useOrders } from '../hooks/useOrders';
import { OrderCard } from '../components/OrderCard';

export const OrderListPage = () => {
  const { data, isLoading, isError } = useOrders();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load orders. Please try again.
        </div>
      </div>
    );
  }

  const orders = data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-16 text-center">
          <p className="text-4xl">📦</p>
          <p className="mt-4 text-lg font-semibold text-gray-900">No orders yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Start shopping to see your orders here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
