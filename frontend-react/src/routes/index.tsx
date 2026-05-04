import { createBrowserRouter } from 'react-router';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { RoleListPage } from '@/features/auth/pages/RoleListPage';
import { RoleCreatePage } from '@/features/auth/pages/RoleCreatePage';
import { RoleEditPage } from '@/features/auth/pages/RoleEditPage';
import { UserListPage } from '@/features/auth/pages/UserListPage';
import { UserEditPage } from '@/features/auth/pages/UserEditPage';
import { HomePage } from '@/features/product/pages/HomePage';
import { ProductListPage } from '@/features/product/pages/ProductListPage';
import { ProductDetailPage } from '@/features/product/pages/ProductDetailPage';
import { CategoryPage } from '@/features/product/pages/CategoryPage';
import { AdminCategoryListPage } from '@/features/product/pages/AdminCategoryListPage';
import { AdminCategoryCreatePage } from '@/features/product/pages/AdminCategoryCreatePage';
import { AdminCategoryEditPage } from '@/features/product/pages/AdminCategoryEditPage';
import { AdminProductListPage } from '@/features/product/pages/AdminProductListPage';
import { AdminProductCreatePage } from '@/features/product/pages/AdminProductCreatePage';
import { AdminProductEditPage } from '@/features/product/pages/AdminProductEditPage';
import { AdminProductVariantsPage } from '@/features/product/pages/AdminProductVariantsPage';
import { CartPage } from '@/features/cart/pages/CartPage';
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage';
import { OrderListPage } from '@/features/order/pages/OrderListPage';
import { AdminOrderListPage } from '@/features/order/pages/AdminOrderListPage';
import { OrderDetailPage } from '@/features/order/pages/OrderDetailPage';
import { ProfilePage } from '@/features/user-profile/pages/ProfilePage';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

const NotFoundPage = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold">404 - Not Found</h1>
  </div>
);

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'categories/:slug', element: <CategoryPage /> },
    ],
  },

  // Auth routes (login, register)
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },

  // Protected routes (require login)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: 'cart', element: <CartPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'orders', element: <OrderListPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'categories', element: <AdminCategoryListPage /> },
          { path: 'categories/create', element: <AdminCategoryCreatePage /> },
          { path: 'categories/:id/edit', element: <AdminCategoryEditPage /> },
          { path: 'products', element: <AdminProductListPage /> },
          { path: 'products/create', element: <AdminProductCreatePage /> },
          { path: 'products/:id/edit', element: <AdminProductEditPage /> },
          { path: 'products/:id/variants', element: <AdminProductVariantsPage /> },
          { path: 'orders', element: <AdminOrderListPage /> },
          { path: 'roles', element: <RoleListPage /> },
          { path: 'roles/create', element: <RoleCreatePage /> },
          { path: 'roles/:id/edit', element: <RoleEditPage /> },
          { path: 'users', element: <UserListPage /> },
          { path: 'users/:id/edit', element: <UserEditPage /> },
        ],
      },
    ],
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
]);
