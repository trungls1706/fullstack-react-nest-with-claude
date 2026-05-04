import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Category } from '../types/product.types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Max 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug: only lowercase letters, numbers, hyphens'),
  parentId: z.number().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Category;
  categories?: Category[];
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
}

export const CategoryForm = ({
  defaultValues,
  categories = [],
  onSubmit,
  isLoading,
}: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      slug: defaultValues?.slug ?? '',
      parentId: defaultValues?.parentId ? Number(defaultValues.parentId) : null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          {...register('name')}
          type="text"
          placeholder="e.g. Electronics"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          {...register('slug')}
          type="text"
          placeholder="e.g. electronics"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Parent Category
        </label>
        <select
          {...register('parentId', { setValueAs: (v) => (v === '' ? null : Number(v)) })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">None (root category)</option>
          {categories
            .filter((c) => c.id !== defaultValues?.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
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
