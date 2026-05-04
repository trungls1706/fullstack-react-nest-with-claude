import { Outlet } from 'react-router';
import { Navbar } from '@/shared/components/Navbar';
import { Footer } from '@/shared/components/Footer';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
