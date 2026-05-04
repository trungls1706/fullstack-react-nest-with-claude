import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';
import { AdminReviewController } from './controllers/admin-review.controller';
import { ReviewController } from './controllers/review.controller';
import { Review } from './entities/review.entity';
import { ReviewRepository } from './repositories/review.repository';
import { ReviewService } from './services/review.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), ProductModule, OrderModule],
  controllers: [ReviewController, AdminReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService],
})
export class ReviewModule {}
