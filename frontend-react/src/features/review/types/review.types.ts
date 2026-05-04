export interface ReviewUser {
  id: number;
  fullName: string;
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  orderId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewUser;
}

export interface CreateReviewPayload {
  orderId: number;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}
