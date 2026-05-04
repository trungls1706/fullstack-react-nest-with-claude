import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useCartStore } from '../stores/cart.store';

export const CartIcon = () => {
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.cartCount);

  return (
    <button
      onClick={() => navigate(ROUTES.CART)}
      className="relative p-2 text-gray-600 hover:text-gray-900"
      title="Cart"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11"
        />
      </svg>
      {cartCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );
};
