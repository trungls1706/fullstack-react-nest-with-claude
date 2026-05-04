import type { Review } from '../types/review.types';

interface Props {
  review: Review;
  currentUserId?: number;
  onEdit?: (review: Review) => void;
  onDelete?: (id: number) => void;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ))}
  </div>
);

export const ReviewCard = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
}: Props) => {
  const isOwner = currentUserId === review.userId;

  return (
    <div className="py-4">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-900">
            {review.user.fullName}
          </span>
          <span className="ml-3 text-xs text-gray-400">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
        {isOwner && onEdit && onDelete && (
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(review)}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (!confirm('Delete this review?')) return;
                onDelete(review.id);
              }}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <StarRating rating={review.rating} />
      {review.comment && (
        <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
      )}
    </div>
  );
};
