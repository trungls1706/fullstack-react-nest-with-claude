import { createBrowserRouter } from 'react-router';
import App from '@/App';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { ROUTES } from './routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [{ index: true, element: <App /> }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <div>Login (TODO)</div> },
      { path: ROUTES.REGISTER, element: <div>Register (TODO)</div> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: ROUTES.CART, element: <div>Cart (TODO)</div> },
          { path: ROUTES.CHECKOUT, element: <div>Checkout (TODO)</div> },
          { path: ROUTES.ORDERS, element: <div>Orders (TODO)</div> },
          { path: ROUTES.PROFILE, element: <div>Profile (TODO)</div> },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [{ element: <AdminLayout />, children: [] }],
  },
]);
