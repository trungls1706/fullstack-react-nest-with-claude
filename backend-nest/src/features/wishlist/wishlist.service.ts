import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { PaginatedResult } from '../../shared/types/pagination.type';
import { getPaginationParams, paginate } from '../../shared/utils/pagination.util';
import { ProductRepository } from '../product/repositories/product.repository';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { WishlistItem } from './entities/wishlist-item.entity';
import { WishlistItemRepository } from './repositories/wishlist-item.repository';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    private readonly wishlistItemRepository: WishlistItemRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async getWishlist(userId: number, page?: number, limit?: number): Promise<PaginatedResult<WishlistItem>> {
    const params = getPaginationParams(page, limit);
    const [items, total] = await this.wishlistItemRepository.findAllByUserId(
      userId,
      params.page,
      params.limit,
    );
    return paginate(items, total, params.page, params.limit);
  }

  async getWishlistCount(userId: number): Promise<{ count: number }> {
    const count = await this.wishlistItemRepository.countByUserId(userId);
    return { count };
  }

  async addToWishlist(userId: number, dto: AddToWishlistDto): Promise<WishlistItem> {
    const product = await this.productRepository.findById(dto.productId);
    if (!product || !product.isActive) {
      throw new NotFoundException(`Product #${dto.productId} not found`);
    }

    const existing = await this.wishlistItemRepository.findByUserIdAndProductId(
      userId,
      dto.productId,
    );
    if (existing) {
      throw new BadRequestException('Product is already in your wishlist');
    }

    this.logger.log(`User #${userId} adding product #${dto.productId} to wishlist`);

    try {
      return await this.wishlistItemRepository.create(userId, dto.productId);
    } catch (err) {
      if (err instanceof QueryFailedError && (err as any).code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Product is already in your wishlist');
      }
      throw err;
    }
  }

  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    const item = await this.wishlistItemRepository.findByUserIdAndProductId(userId, productId);
    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    this.logger.log(`User #${userId} removing product #${productId} from wishlist`);
    await this.wishlistItemRepository.delete(item.id);
  }
}
