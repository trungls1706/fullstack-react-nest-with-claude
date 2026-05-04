import { Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { APP_NAME } from '@/config/constants';

export const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">{APP_NAME}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Discover thousands of products at great prices. Your one-stop shop for everything you need.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Shop</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to={ROUTES.PRODUCTS} className="text-sm text-gray-400 transition-colors hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link to={ROUTES.HOME} className="text-sm text-gray-400 transition-colors hover:text-white">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Account</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to={ROUTES.PROFILE} className="text-sm text-gray-400 transition-colors hover:text-white">
                  Profile
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ORDERS} className="text-sm text-gray-400 transition-colors hover:text-white">
                  Orders
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CART} className="text-sm text-gray-400 transition-colors hover:text-white">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Support</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <span className="text-sm text-gray-400">help@hoidanit.com</span>
              </li>
              <li>
                <span className="text-sm text-gray-400">1-800</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6">
          <p className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
