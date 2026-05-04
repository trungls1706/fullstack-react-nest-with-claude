import { useCart } from '../hooks/useCart';
import { CartEmpty } from '../components/CartEmpty';
import { CartItemRow } from '../components/CartItemRow';
import { CartSummary } from '../components/CartSummary';

export const CartPage = () => {
  const { data: cart, isLoading, isError } = useCart();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load cart. Please try again.
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <CartEmpty />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Shopping Cart
        <span className="ml-2 text-base font-normal text-gray-500">
          ({items.length} {items.length === 1 ? 'item' : 'items'})
        </span>
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items list */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white px-6">
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <CartSummary items={items} />
        </div>
      </div>
    </div>
  );
};
