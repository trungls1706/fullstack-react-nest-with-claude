import { Navigate, Outlet } from 'react-router';
import { ROUTES } from './routes';
import { getAccessToken } from '@/shared/lib/axios';

export const ProtectedRoute = () => {
  const isAuthenticated = Boolean(getAccessToken());
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Outlet />;
};
