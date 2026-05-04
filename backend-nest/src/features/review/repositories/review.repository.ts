import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(Review)
    private readonly repo: Repository<Review>,
  ) {}

  async findAllByProductId(
    productId: number,
    page: number,
    limit: number,
  ): Promise<[Review[], number]> {
    return this.repo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.productId = :productId', { productId })
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  findById(id: number): Promise<Review | null> {
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }

  findByUserIdAndProductIdAndOrderId(
    userId: number,
    productId: number,
    orderId: number,
  ): Promise<Review | null> {
    return this.repo.findOne({ where: { userId, productId, orderId } });
  }

  save(review: Partial<Review>): Promise<Review> {
    return this.repo.save(review);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
