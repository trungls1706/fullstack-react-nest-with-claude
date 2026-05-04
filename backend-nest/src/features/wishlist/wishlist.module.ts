import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '../product/product.module';
import { WishlistItem } from './entities/wishlist-item.entity';
import { WishlistItemRepository } from './repositories/wishlist-item.repository';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [TypeOrmModule.forFeature([WishlistItem]), ProductModule],
  controllers: [WishlistController],
  providers: [WishlistService, WishlistItemRepository],
  exports: [WishlistService],
})
export class WishlistModule {}
