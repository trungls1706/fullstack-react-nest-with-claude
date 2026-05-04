import { Link, useNavigate } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { RegisterForm, type RegisterFormValues } from '../components/RegisterForm';
import { useLogin, useRegister } from '../hooks/useAuth';
import { extractApiError } from '../utils/error.util';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const login = useLogin();

  const handleSubmit = (values: RegisterFormValues) => {
    const payload = {
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      phone: values.phone || undefined,
    };
    registerMutation.mutate(payload, {
      onSuccess: () => {
        login.mutate(
          { email: payload.email, password: payload.password },
          { onSuccess: () => navigate(ROUTES.HOME, { replace: true }) },
        );
      },
    });
  };

  const submitting = registerMutation.isPending || login.isPending;
  const error = registerMutation.isError
    ? extractApiError(registerMutation.error, 'Registration failed')
    : login.isError
      ? extractApiError(login.error, 'Auto sign-in failed')
      : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <RegisterForm submitting={submitting} errorMessage={error} onSubmit={handleSubmit} />
      <p className="text-sm">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-blue-600 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};
