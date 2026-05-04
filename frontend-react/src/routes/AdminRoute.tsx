import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from './routes';

export const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
};
