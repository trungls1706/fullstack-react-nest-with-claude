import { Outlet } from 'react-router';

export const MainLayout = () => (
  <div className="min-h-screen flex flex-col">
    <header className="border-b px-6 py-4">
      <h1 className="font-semibold">E-commerce</h1>
    </header>
    <main className="flex-1">
      <Outlet />
    </main>
    <footer className="border-t px-6 py-4 text-sm text-gray-500">
      © {new Date().getFullYear()}
    </footer>
  </div>
);
