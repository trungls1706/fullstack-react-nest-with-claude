import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderRepository } from '../../order/repositories/order.repository';
import { ProductRepository } from '../../product/repositories/product.repository';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { Review } from '../entities/review.entity';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewService } from '../services/review.service';

const mockReview = (overrides: Partial<Review> = {}): Review => ({
  id: 1,
  userId: 10,
  productId: 5,
  orderId: 100,
  rating: 5,
  comment: 'Great!',
  user: null as any,
  product: null as any,
  order: null as any,
  createdAt: new Date(),
  ...overrides,
});

const mockOrderWithProduct = (productId: number) => ({
  id: 100,
  userId: 10,
  items: [
    {
      productVariantId: 20,
      productVariant: { id: 20, productId },
    },
  ],
});

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepo: jest.Mocked<ReviewRepository>;
  let productRepo: jest.Mocked<ProductRepository>;
  let orderRepo: jest.Mocked<OrderRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: ReviewRepository,
          useValue: {
            findAllByProductId: jest.fn(),
            findById: jest.fn(),
            findByUserIdAndProductIdAndOrderId: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ProductRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: OrderRepository,
          useValue: { findByIdAndUserId: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    reviewRepo = module.get(ReviewRepository);
    productRepo = module.get(ProductRepository);
    orderRepo = module.get(OrderRepository);
  });

  describe('getProductReviews', () => {
    it('should return paginated reviews for a product', async () => {
      const reviews = [mockReview()];
      reviewRepo.findAllByProductId.mockResolvedValue([reviews, 1]);

      const result = await service.getProductReviews(5);

      expect(reviewRepo.findAllByProductId).toHaveBeenCalledWith(5, 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('createReview', () => {
    const dto: CreateReviewDto = { orderId: 100, rating: 5, comment: 'Great!' };

    it('should create a review for a verified purchase', async () => {
      productRepo.findById.mockResolvedValue({ id: 5 } as any);
      orderRepo.findByIdAndUserId.mockResolvedValue(mockOrderWithProduct(5) as any);
      reviewRepo.findByUserIdAndProductIdAndOrderId.mockResolvedValue(null);
      reviewRepo.save.mockResolvedValue(mockReview());

      const result = await service.createReview(10, 5, dto);

      expect(reviewRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 10, productId: 5, orderId: 100, rating: 5 }),
      );
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when product not found', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(service.createReview(10, 99, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when order not found or not owned', async () => {
      productRepo.findById.mockResolvedValue({ id: 5 } as any);
      orderRepo.findByIdAndUserId.mockResolvedValue(null);

      await expect(service.createReview(10, 5, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when order does not contain product', async () => {
      productRepo.findById.mockResolvedValue({ id: 5 } as any);
      orderRepo.findByIdAndUserId.mockResolvedValue(mockOrderWithProduct(99) as any);

      await expect(service.createReview(10, 5, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when already reviewed', async () => {
      productRepo.findById.mockResolvedValue({ id: 5 } as any);
      orderRepo.findByIdAndUserId.mockResolvedValue(mockOrderWithProduct(5) as any);
      reviewRepo.findByUserIdAndProductIdAndOrderId.mockResolvedValue(mockReview());

      await expect(service.createReview(10, 5, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateReview', () => {
    const dto: UpdateReviewDto = { rating: 4, comment: 'Updated' };

    it('should update a review owned by the user', async () => {
      const review = mockReview();
      reviewRepo.findById.mockResolvedValue(review);
      reviewRepo.save.mockResolvedValue({ ...review, ...dto });

      const result = await service.updateReview(1, 10, dto);

      expect(reviewRepo.save).toHaveBeenCalledWith(expect.objectContaining({ rating: 4 }));
      expect(result.rating).toBe(4);
    });

    it('should throw NotFoundException when review not found', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(service.updateReview(99, 10, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not own the review', async () => {
      reviewRepo.findById.mockResolvedValue(mockReview({ userId: 999 }));

      await expect(service.updateReview(1, 10, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteReview', () => {
    it('should delete a review owned by the user', async () => {
      reviewRepo.findById.mockResolvedValue(mockReview());

      await service.deleteReview(1, 10);

      expect(reviewRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when review not found', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(service.deleteReview(99, 10)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not own the review', async () => {
      reviewRepo.findById.mockResolvedValue(mockReview({ userId: 999 }));

      await expect(service.deleteReview(1, 10)).rejects.toThrow(NotFoundException);
    });
  });

  describe('adminDeleteReview', () => {
    it('should delete any review as admin', async () => {
      reviewRepo.findById.mockResolvedValue(mockReview());

      await service.adminDeleteReview(1);

      expect(reviewRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when review not found', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(service.adminDeleteReview(99)).rejects.toThrow(NotFoundException);
    });
  });
});
