import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { User } from '../auth/entities/user.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { QueryWishlistDto } from './dto/query-wishlist.dto';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@CurrentUser() user: User, @Query() query: QueryWishlistDto) {
    return this.wishlistService.getWishlist(user.id, query.page, query.limit);
  }

  @Get('count')
  getWishlistCount(@CurrentUser() user: User) {
    return this.wishlistService.getWishlistCount(user.id);
  }

  @Post()
  addToWishlist(@CurrentUser() user: User, @Body() dto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(user.id, dto);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromWishlist(
    @CurrentUser() user: User,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.removeFromWishlist(user.id, productId);
  }
}
