import { Link, useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { extractApiError } from '@/shared/utils/error';
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useLogin();

  const errorMessage = error ? extractApiError(error) : undefined;

  const handleSubmit = (data: { email: string; password: string }) => {
    mutate(data, {
      onSuccess: () => {
        void navigate(ROUTES.HOME);
      },
    });
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          error={errorMessage}
        />

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link
            to={ROUTES.REGISTER}
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
