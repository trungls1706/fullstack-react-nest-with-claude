import {
  Body,
  Controller,
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
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { QueryOrderDto } from '../dto/query-order.dto';
import { CheckoutService } from '../services/checkout.service';
import { OrderService } from '../services/order.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly checkoutService: CheckoutService,
  ) {}

  @Get()
  getMyOrders(@CurrentUser() user: User, @Query() query: QueryOrderDto) {
    return this.orderService.getMyOrders(user.id, query);
  }

  @Get(':id')
  getMyOrderById(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.orderService.getMyOrderById(id, user.id);
  }

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  checkout(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.checkoutService.checkout(user.id, dto);
  }

  @Patch(':id/cancel')
  cancelOrder(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.orderService.cancelOrder(id, user.id);
  }
}
