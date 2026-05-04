import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'At least 8 characters').max(72),
  fullName: z.string().min(2, 'At least 2 characters').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
});

export type RegisterFormValues = z.infer<typeof schema>;

interface Props {
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (values: RegisterFormValues) => void;
}

export const RegisterForm = ({ submitting, errorMessage, onSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', fullName: '', phone: '' },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 w-full max-w-sm"
      aria-label="register-form"
    >
      <div>
        <label className="block text-sm" htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          className="border rounded px-3 py-2 w-full"
          {...register('email')}
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm" htmlFor="reg-fullname">Full name</label>
        <input
          id="reg-fullname"
          autoComplete="name"
          className="border rounded px-3 py-2 w-full"
          {...register('fullName')}
        />
        {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-sm" htmlFor="reg-phone">Phone (optional)</label>
        <input
          id="reg-phone"
          autoComplete="tel"
          className="border rounded px-3 py-2 w-full"
          {...register('phone')}
        />
        {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="block text-sm" htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          className="border rounded px-3 py-2 w-full"
          {...register('password')}
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
      </div>

      {errorMessage && <p className="text-red-600 text-sm" role="alert">{errorMessage}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
};
