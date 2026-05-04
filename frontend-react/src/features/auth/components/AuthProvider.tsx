import { useEffect, useState } from 'react';
import { setAccessToken } from '@/shared/lib/axios';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

interface Props {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Try to refresh the token using the HTTP-only cookie
        const refreshRes = await authService.refresh();
        const newToken = refreshRes.data.data.accessToken;
        setAccessToken(newToken);

        // 2. Fetch the user profile using the new token
        const userRes = await authService.me();
        setUser(userRes.data.data);
      } catch (error) {
        // If refresh fails (no cookie, expired, etc), just remain logged out
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    void initAuth();
  }, [setUser, logout]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent flex"></div>
      </div>
    );
  }

  return <>{children}</>;
};
