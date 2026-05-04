# Auth Feature

## Owns
- Login page & form
- Register page & form
- Auth Zustand store (user, accessToken, isAuthenticated)
- JWT refresh logic (via axios interceptor in shared/lib/axios.ts)
- Logout

## Key Rules
- Access token stored in **memory only** (NOT localStorage)
- Refresh token managed by **httpOnly cookie** (server sets it)
- Use `setAccessToken()` / `clearAccessToken()` from shared/lib/axios.ts
- Import from `react-router`, NOT `react-router-dom`

## Store Shape
```ts
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}
```
