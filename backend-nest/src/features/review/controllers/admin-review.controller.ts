import { Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ReviewService } from '../services/review.service';

@Controller('admin/reviews')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  adminDeleteReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.adminDeleteReview(id);
  }
}
