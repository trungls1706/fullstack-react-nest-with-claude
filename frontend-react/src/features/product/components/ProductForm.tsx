import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Category, Product } from '../types/product.types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Max 255 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255, 'Max 255 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug: only lowercase letters, numbers, hyphens'),
  categoryId: z.number().min(1, 'Category is required'),
  description: z.string().optional(),
  thumbnailUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Product;
  categories: Category[];
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
}

export const ProductForm = ({
  defaultValues,
  categories,
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
      categoryId: defaultValues?.categoryId ? Number(defaultValues.categoryId) : undefined,
      description: defaultValues?.description ?? '',
      thumbnailUrl: defaultValues?.thumbnailUrl ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          {...register('name')}
          type="text"
          placeholder="Product name"
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
          placeholder="product-slug"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          {...register('categoryId', { setValueAs: (v) => Number(v) })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select a category</option>
          {categories
            .filter((c) => !c.parentId)
            .map((parentCategory) => {
              const children = categories.filter(
                (c) => c.parentId === parentCategory.id
              );

              return (
                <optgroup key={parentCategory.id} label={parentCategory.name}>
                  {/* Option to select the parent category itself */}
                  <option value={parentCategory.id}>
                    {parentCategory.name} (General)
                  </option>
                  
                  {/* Render all children categories */}
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      -- {child.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          {/* Render any category that somehow doesn't have a parent but isn't caught, or vice versa if structure is deep (for this task, 2 levels is enough) */}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Product description..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Thumbnail URL
        </label>
        <input
          {...register('thumbnailUrl')}
          type="text"
          placeholder="https://..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.thumbnailUrl && (
          <p className="mt-1 text-sm text-red-600">
            {errors.thumbnailUrl.message}
          </p>
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
