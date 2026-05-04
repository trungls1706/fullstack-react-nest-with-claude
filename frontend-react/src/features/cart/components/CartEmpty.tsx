import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';

export const CartEmpty = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-6xl">🛒</div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Your cart is empty
      </h2>
      <p className="mb-6 text-gray-500">
        Browse products and add items to get started.
      </p>
      <button
        onClick={() => navigate(ROUTES.PRODUCTS)}
        className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Shop Now
      </button>
    </div>
  );
};
