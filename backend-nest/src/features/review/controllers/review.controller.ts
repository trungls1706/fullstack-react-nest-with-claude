import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { User } from '../../auth/entities/user.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ReviewService } from '../services/review.service';

class ReviewPaginationQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number;
}

@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('products/:productId/reviews')
  @Public()
  getProductReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: ReviewPaginationQuery,
  ) {
    return this.reviewService.getProductReviews(productId, query.page, query.limit);
  }

  @Post('products/:productId/reviews')
  @HttpCode(HttpStatus.CREATED)
  createReview(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: User,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.createReview(user.id, productId, dto);
  }

  @Patch('reviews/:id')
  updateReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(id, user.id, dto);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteReview(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.reviewService.deleteReview(id, user.id);
  }
}
