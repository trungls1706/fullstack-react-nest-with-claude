import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'At least 8 characters').max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type ChangePasswordFormValues = z.infer<typeof schema>;

interface Props {
  submitting?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
  onSubmit: (values: { currentPassword: string; newPassword: string }) => void;
}

export const ChangePasswordForm = ({
  submitting,
  errorMessage,
  successMessage,
  onSubmit,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
  });

  return (
    <form onSubmit={submit} className="space-y-3 max-w-sm" aria-label="change-password-form">
      <div>
        <label className="block text-sm">Current password</label>
        <input
          type="password"
          autoComplete="current-password"
          className="border rounded px-3 py-2 w-full"
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <p className="text-red-600 text-sm">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm">New password</label>
        <input
          type="password"
          autoComplete="new-password"
          className="border rounded px-3 py-2 w-full"
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="text-red-600 text-sm">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm">Confirm new password</label>
        <input
          type="password"
          autoComplete="new-password"
          className="border rounded px-3 py-2 w-full"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
        )}
      </div>

      {errorMessage && <p className="text-red-600 text-sm" role="alert">{errorMessage}</p>}
      {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {submitting ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
};
