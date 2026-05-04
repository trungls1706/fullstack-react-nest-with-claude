import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Role } from '../types/role.types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Max 50 characters'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Role;
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
}

export const RoleForm = ({ defaultValues, onSubmit, isLoading }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultValues?.name ?? '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Role Name
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="e.g. admin, customer"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
