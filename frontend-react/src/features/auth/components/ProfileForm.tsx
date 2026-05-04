import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AuthUser } from '../types/auth.types';

const schema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof schema>;

interface Props {
  initial: AuthUser;
  submitting?: boolean;
  onSubmit: (values: ProfileFormValues) => void;
}

export const ProfileForm = ({ initial, submitting, onSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: initial.fullName,
      phone: initial.phone ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-sm">
      <div>
        <label className="block text-sm">Email</label>
        <input
          type="email"
          disabled
          value={initial.email}
          className="border rounded px-3 py-2 w-full bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm">Full name</label>
        <input className="border rounded px-3 py-2 w-full" {...register('fullName')} />
        {errors.fullName && (
          <p className="text-red-600 text-sm">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm">Phone</label>
        <input className="border rounded px-3 py-2 w-full" {...register('phone')} />
        {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {submitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
};
