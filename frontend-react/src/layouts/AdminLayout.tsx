import { useState } from 'react';
import { Outlet } from 'react-router';
import { AdminNavbar } from './AdminNavbar';
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <AdminNavbar
        isMenuCollapsed={isSidebarCollapsed}
        toggleMenu={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="pt-16">
        <AdminSidebar isCollapsed={isSidebarCollapsed} />
        <main
          className={`min-h-[calc(100vh-4rem)] p-6 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
