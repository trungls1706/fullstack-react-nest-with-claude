import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ProductVariant } from '../types/product.types';

const schema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50, 'Max 50 characters'),
  color: z.string().optional(),
  size: z.string().optional(),
  price: z.number({ required_error: 'Price is required' }).positive('Must be positive'),
  salePrice: z.number().positive('Must be positive').optional().nullable(),
  stockQuantity: z
    .number({ required_error: 'Stock is required' })
    .int('Must be integer')
    .min(0, 'Min 0'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: ProductVariant;
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
}

export const VariantForm = ({ defaultValues, onSubmit, isLoading }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: defaultValues?.sku ?? '',
      color: defaultValues?.color ?? '',
      size: defaultValues?.size ?? '',
      price: defaultValues?.price ?? undefined,
      salePrice: defaultValues?.salePrice ?? null,
      stockQuantity: defaultValues?.stockQuantity ?? 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            {...register('sku')}
            type="text"
            placeholder="e.g. SHIRT-WHITE-L"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock
          </label>
          <input
            {...register('stockQuantity', { valueAsNumber: true })}
            type="number"
            min={0}
            placeholder="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.stockQuantity && (
            <p className="mt-1 text-sm text-red-600">
              {errors.stockQuantity.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <input
            {...register('color')}
            type="text"
            placeholder="e.g. White"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Size
          </label>
          <input
            {...register('size')}
            type="text"
            placeholder="e.g. L"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (VND)
          </label>
          <input
            {...register('price', { valueAsNumber: true })}
            type="number"
            min={0}
            placeholder="250000"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sale Price (VND)
          </label>
          <input
            {...register('salePrice', {
              setValueAs: (v) => (v === '' ? null : Number(v)),
            })}
            type="number"
            min={0}
            placeholder="Optional"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Variant'}
      </button>
    </form>
  );
};
