import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { formatPrice } from '@/shared/utils/format';
import { useClearCart } from '../hooks/useClearCart';
import type { CartItem } from '../types/cart.types';

interface Props {
  items: CartItem[];
}

export const CartSummary = ({ items }: Props) => {
  const navigate = useNavigate();
  const { mutate: clearCart, isPending } = useClearCart();

  const subtotal = items.reduce((sum, item) => {
    const price =
      item.productVariant?.salePrice ?? item.productVariant?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Order Summary
      </h2>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Items ({totalItems})</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="text-green-600">Calculated at checkout</span>
        </div>
      </div>

      <div className="my-4 border-t border-gray-200" />

      <div className="mb-6 flex justify-between text-base font-semibold text-gray-900">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      <button
        onClick={() => navigate(ROUTES.CHECKOUT)}
        className="w-full rounded-md bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Proceed to Checkout
      </button>

      <button
        onClick={() => {
          if (!confirm('Clear all items from cart?')) return;
          clearCart();
        }}
        disabled={isPending}
        className="mt-3 w-full rounded-md border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
      >
        Clear Cart
      </button>
    </div>
  );
};
