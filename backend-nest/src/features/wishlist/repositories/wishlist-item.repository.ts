import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from '../entities/wishlist-item.entity';

@Injectable()
export class WishlistItemRepository {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly repo: Repository<WishlistItem>,
  ) {}

  async findAllByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<[WishlistItem[], number]> {
    return this.repo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.product', 'product')
      .where('item.userId = :userId', { userId })
      .orderBy('item.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  countByUserId(userId: number): Promise<number> {
    return this.repo.count({ where: { userId } });
  }

  findByUserIdAndProductId(userId: number, productId: number): Promise<WishlistItem | null> {
    return this.repo.findOne({ where: { userId, productId } });
  }

  create(userId: number, productId: number): Promise<WishlistItem> {
    const item = this.repo.create({ userId, productId });
    return this.repo.save(item);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
