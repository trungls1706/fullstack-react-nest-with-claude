import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { APP_NAME } from '@/config/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';

interface AdminNavbarProps {
  toggleMenu: () => void;
}

export const AdminNavbar = ({ toggleMenu }: AdminNavbarProps) => {
  const { user } = useAuthStore();
  const { mutate: logoutRequest } = useLogout();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutRequest();
    setUserMenuOpen(false);
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b border-indigo-500/20 bg-slate-950/80 px-4 shadow-lg shadow-indigo-500/10 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMenu}
          className="rounded-lg p-2 text-indigo-200 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <Link to={ROUTES.HOME} className="flex flex-shrink-0 items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0Zm7.5 0a.375.375 0 1 1-.75 0Z" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-xl font-black tracking-tight text-transparent">
            {APP_NAME} <span className="font-medium text-slate-400">Admin</span>
          </span>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div ref={userMenuRef} className="relative flex items-center gap-2 border-l border-white/10 pl-4">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 rounded-xl p-1 pr-3 transition-colors hover:bg-white/5 active:bg-white/10"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              {user?.fullName?.charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold text-slate-200">{user?.fullName || 'Admin User'}</p>
              <p className="text-xs text-indigo-400">Administrator</p>
            </div>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 origin-top-right animate-[fadeIn_0.15s_ease-out] rounded-2xl border border-white/10 bg-slate-900/95 p-1.5 shadow-2xl shadow-indigo-900/50 backdrop-blur-xl">
              <div className="border-b border-white/5 px-3 py-3 mb-1">
                <p className="text-sm font-bold text-white truncate">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to={ROUTES.PROFILE}
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                My Profile
              </Link>
              
              <Link
                to={ROUTES.HOME}
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72L4.318 3.44A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 8.65h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .415.336.75.75.75Z" />
                </svg>
                Storefront
              </Link>

              <div className="my-1 border-t border-white/5" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
