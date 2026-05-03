import { Outlet } from 'react-router';

export const AdminLayout = () => (
  <div className="min-h-screen flex">
    <aside className="w-60 border-r p-4">
      <h2 className="font-semibold">Admin</h2>
    </aside>
    <main className="flex-1 p-6">
      <Outlet />
    </main>
  </div>
);
