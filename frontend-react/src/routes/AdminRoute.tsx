import { Navigate, Outlet } from 'react-router';
import { ROUTES } from './routes';
import { useAuthStore } from '@/features/auth';

export const AdminRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user && user.role !== 'admin') return <Navigate to={ROUTES.HOME} replace />;
  return <Outlet />;
};
