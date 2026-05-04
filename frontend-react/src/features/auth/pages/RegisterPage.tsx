import { Link, useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { extractApiError } from '@/shared/utils/error';
import { RegisterForm } from '../components/RegisterForm';
import { useRegister } from '../hooks/useRegister';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useRegister();

  const errorMessage = error ? extractApiError(error) : undefined;

  const handleSubmit = (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => {
    mutate(data, {
      onSuccess: () => {
        void navigate(ROUTES.LOGIN);
      },
    });
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <RegisterForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          error={errorMessage}
        />

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
