import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from './routes';

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};
