import { Outlet } from 'react-router';

export const AuthLayout = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
      <Outlet />
    </div>
  </div>
);
