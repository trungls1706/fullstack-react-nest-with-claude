import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResult } from '../../../shared/types/pagination.type';
import { getPaginationParams, paginate } from '../../../shared/utils/pagination.util';
import { OrderRepository } from '../../order/repositories/order.repository';
import { ProductRepository } from '../../product/repositories/product.repository';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { Review } from '../entities/review.entity';
import { ReviewRepository } from '../repositories/review.repository';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async getProductReviews(
    productId: number,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Review>> {
    const params = getPaginationParams(page, limit);
    const [reviews, total] = await this.reviewRepository.findAllByProductId(
      productId,
      params.page,
      params.limit,
    );
    return paginate(reviews, total, params.page, params.limit);
  }

  async createReview(userId: number, productId: number, dto: CreateReviewDto): Promise<Review> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException(`Product #${productId} not found`);

    const order = await this.orderRepository.findByIdAndUserId(dto.orderId, userId);
    if (!order) throw new NotFoundException('Order not found');

    const hasProduct = order.items.some(
      (item) => item.productVariant !== null && item.productVariant.productId === productId,
    );
    if (!hasProduct) {
      throw new ForbiddenException('You must purchase this product before reviewing');
    }

    const existing = await this.reviewRepository.findByUserIdAndProductIdAndOrderId(
      userId,
      productId,
      dto.orderId,
    );
    if (existing) {
      throw new BadRequestException('You have already reviewed this product for this order');
    }

    this.logger.log(`User #${userId} creating review for product #${productId}`);
    return this.reviewRepository.save({
      userId,
      productId,
      orderId: dto.orderId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });
  }

  async updateReview(id: number, userId: number, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepository.findById(id);
    if (!review || review.userId !== userId) {
      throw new NotFoundException(`Review #${id} not found`);
    }
    return this.reviewRepository.save({ ...review, ...dto });
  }

  async deleteReview(id: number, userId: number): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review || review.userId !== userId) {
      throw new NotFoundException(`Review #${id} not found`);
    }
    await this.reviewRepository.delete(id);
  }

  async adminDeleteReview(id: number): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) throw new NotFoundException(`Review #${id} not found`);
    await this.reviewRepository.delete(id);
  }
}
