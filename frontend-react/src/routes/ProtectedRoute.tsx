import { Navigate, Outlet } from 'react-router';
import { ROUTES } from './routes';
import { useAuthStore } from '@/features/auth';

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Outlet />;
};
