import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '../types/user.types';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal('')),
  fullName: z.string().min(2).max(100),
  roleId: z.number().int().positive(),
  phone: z.string().min(8).max(20).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type UserFormValues = z.infer<typeof schema>;

interface Props {
  initial?: User;
  submitting?: boolean;
  onSubmit: (values: UserFormValues) => void;
}

export const UserForm = ({ initial, submitting, onSubmit }: Props) => {
  const isEdit = Boolean(initial);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          email: initial.email,
          fullName: initial.fullName,
          roleId: initial.roleId,
          phone: initial.phone ?? '',
          isActive: initial.isActive,
          password: '',
        }
      : { isActive: true, password: '', roleId: 1, email: '', fullName: '', phone: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-lg">
      <div>
        <label className="block text-sm">Email</label>
        <input className="border rounded px-3 py-2 w-full" {...register('email')} />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm">
          Password {isEdit && <span className="text-gray-400">(leave blank to keep)</span>}
        </label>
        <input
          type="password"
          className="border rounded px-3 py-2 w-full"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-red-600 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm">Full name</label>
        <input className="border rounded px-3 py-2 w-full" {...register('fullName')} />
        {errors.fullName && (
          <p className="text-red-600 text-sm">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm">Role ID</label>
        <input
          type="number"
          className="border rounded px-3 py-2 w-full"
          {...register('roleId', { valueAsNumber: true })}
        />
        {errors.roleId && <p className="text-red-600 text-sm">{errors.roleId.message}</p>}
      </div>

      <div>
        <label className="block text-sm">Phone</label>
        <input className="border rounded px-3 py-2 w-full" {...register('phone')} />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('isActive')} />
        <span>Active</span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {submitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
      </button>
    </form>
  );
};
