import { Link, useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { LoginForm, type LoginFormValues } from '../components/LoginForm';
import { useLogin } from '../hooks/useAuth';
import { extractApiError } from '../utils/error.util';

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useLogin();

  const handleSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: () => navigate(ROUTES.HOME, { replace: true }),
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <LoginForm
        submitting={login.isPending}
        errorMessage={login.isError ? extractApiError(login.error, 'Login failed') : null}
        onSubmit={handleSubmit}
      />
      <p className="text-sm">
        No account?{' '}
        <Link to={ROUTES.REGISTER} className="text-blue-600 underline">
          Create one
        </Link>
      </p>
    </div>
  );
};
