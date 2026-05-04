import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '@/routes/routes';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { orderService } from '@/features/order/services/order.service';
import { useProductReviews } from '../hooks/useProductReviews';
import { useCreateReview } from '../hooks/useCreateReview';
import { useUpdateReview } from '../hooks/useUpdateReview';
import { useDeleteReview } from '../hooks/useDeleteReview';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import type { Review, CreateReviewPayload, UpdateReviewPayload } from '../types/review.types';

interface Props {
  productId: number;
  currentUserId?: number;
}

type EditState = { review: Review } | null;

export const ReviewList = ({
  productId,
  currentUserId,
}: Props) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editState, setEditState] = useState<EditState>(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading } = useProductReviews(productId);
  const { mutate: createReview, isPending: isCreating } =
    useCreateReview(productId);
  const { mutate: updateReview, isPending: isUpdating } =
    useUpdateReview(productId);
  const { mutate: deleteReview } = useDeleteReview(productId);

  // Fetch delivered orders for the current user (only when authenticated and form is open)
  const { data: ordersData } = useQuery({
    queryKey: ['orders', 'delivered'],
    queryFn: () => orderService.getAll({ status: 'delivered', limit: 50 }),
    enabled: isAuthenticated && showCreateForm,
  });

  const deliveredOrders = ordersData?.data?.map((o) => ({
    id: o.id,
    createdAt: o.createdAt,
  }));

  const reviews = data?.data ?? [];
  const total = data?.meta?.total ?? reviews.length;

  const hasReviewed =
    currentUserId !== undefined &&
    reviews.some((r) => r.userId === currentUserId);

  const handleCreate = (payload: CreateReviewPayload) => {
    createReview(payload, { onSuccess: () => setShowCreateForm(false) });
  };

  const handleUpdate = (payload: UpdateReviewPayload) => {
    if (!editState) return;
    updateReview(
      { reviewId: editState.review.id, data: payload },
      { onSuccess: () => setEditState(null) },
    );
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Reviews
          {total > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({total})
            </span>
          )}
        </h2>
        {/* Write a Review button */}
        {isAuthenticated && currentUserId && !hasReviewed && !showCreateForm && !editState && (
          <button
            id="write-review-btn"
            onClick={() => setShowCreateForm(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Write a Review
          </button>
        )}
        {!isAuthenticated && !showCreateForm && !editState && (
          <Link
            to={ROUTES.LOGIN}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign in to Review
          </Link>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Your Review
          </h3>
          {deliveredOrders && deliveredOrders.length === 0 ? (
            <div className="text-sm text-gray-500">
              <p>You need a delivered order to write a review.</p>
              <button
                onClick={() => setShowCreateForm(false)}
                className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <ReviewForm
              orders={deliveredOrders}
              isLoading={isCreating}
              onSubmit={handleCreate as (data: { orderId: number; rating: number; comment?: string }) => void}
              onCancel={() => setShowCreateForm(false)}
            />
          )}
        </div>
      )}

      {/* Edit form */}
      {editState && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Edit Review
          </h3>
          <ReviewForm
            defaultValues={editState.review}
            isLoading={isUpdating}
            onSubmit={handleUpdate as (data: { orderId: number; rating: number; comment?: string }) => void}
            onCancel={() => setEditState(null)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={(r) => setEditState({ review: r })}
              onDelete={(id) => deleteReview(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
