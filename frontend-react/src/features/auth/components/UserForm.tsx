import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { User } from '../types/user.types';
import type { Role } from '../types/role.types';

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Max 100 characters'),
  phone: z.string().max(20, 'Max 20 characters').optional(),
  roleId: z.coerce.number().min(1, 'Role is required'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: User;
  roles: Role[];
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
}

export const UserForm = ({ defaultValues, roles, onSubmit, isLoading }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? '',
      phone: defaultValues?.phone ?? '',
      roleId: defaultValues?.roleId ?? 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          {...register('fullName')}
          type="text"
          placeholder="e.g. Nguyen Van A"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          {...register('phone')}
          type="text"
          placeholder="e.g. 0901234567"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          {...register('roleId')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value={0}>-- Select Role --</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {errors.roleId && (
          <p className="mt-1 text-sm text-red-600">{errors.roleId.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};
