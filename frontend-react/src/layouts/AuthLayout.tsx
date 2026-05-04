import { Outlet } from 'react-router';

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <Outlet />
      </div>
    </div>
  );
};
