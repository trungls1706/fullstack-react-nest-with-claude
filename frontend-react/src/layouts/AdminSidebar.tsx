import { Link, useLocation } from 'react-router';
import { ROUTES } from '@/routes/routes';

const NAV_ITEMS = [
  {
    title: 'Dashboard',
    path: ROUTES.ADMIN,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: 'Products',
    path: ROUTES.ADMIN_PRODUCTS,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'Categories',
    path: ROUTES.ADMIN_CATEGORIES,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    title: 'Orders',
    path: ROUTES.ADMIN_ORDERS ?? '/admin/orders',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    title: 'Users',
    path: ROUTES.ADMIN_USERS,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Roles',
    path: ROUTES.ADMIN_ROLES,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export const AdminSidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const location = useLocation();

  return (
    <aside
      className={`fixed bottom-0 left-0 top-16 z-30 border-r border-indigo-500/10 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex h-full flex-col justify-between overflow-y-auto py-6">
        <ul className="space-y-3 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== ROUTES.ADMIN && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`group relative flex items-center rounded-xl p-3 transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/10 text-indigo-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-indigo-500/20'
                      : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-indigo-200'
                  }`}
                  title={isCollapsed ? item.title : undefined}
                >
                  {/* Glowing active indicator line */}
                  {isActive && (
                    <div className="absolute -left-3 top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]"></div>
                  )}

                  <div className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'group-hover:scale-110 group-hover:text-indigo-300'}`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="ml-4 truncate text-sm font-bold tracking-wide">{item.title}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};
