import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Review } from '../types/review.types';

const schema = z.object({
  orderId: z.number({ required_error: 'Order is required' }).min(1),
  rating: z.number().min(1, 'Rating is required').max(5),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Review;
  orders?: { id: number; createdAt: string }[];
  isLoading?: boolean;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`text-2xl leading-none transition-colors ${
            star <= (hovered || value) ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export const ReviewForm = ({
  defaultValues,
  orders,
  isLoading,
  onSubmit,
  onCancel,
}: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0 },
  });

  const rating = watch('rating');

  useEffect(() => {
    if (defaultValues) {
      reset({
        orderId: defaultValues.orderId,
        rating: defaultValues.rating,
        comment: defaultValues.comment ?? '',
      });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Order selector — only shown on create */}
      {!defaultValues && orders && orders.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Order
          </label>
          <select
            {...register('orderId', { valueAsNumber: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select order...</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                Order #{o.id} ({new Date(o.createdAt).toLocaleDateString()})
              </option>
            ))}
          </select>
          {errors.orderId && (
            <p className="mt-1 text-xs text-red-500">{errors.orderId.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Rating
        </label>
        <StarPicker value={rating} onChange={(v) => setValue('rating', v)} />
        {errors.rating && (
          <p className="mt-1 text-xs text-red-500">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Comment (optional)
        </label>
        <textarea
          {...register('comment')}
          rows={3}
          placeholder="Share your experience..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};
