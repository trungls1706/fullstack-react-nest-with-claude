import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { QueryOrderDto } from '../dto/query-order.dto';
import { UpdateOrderPaymentDto } from '../dto/update-order-payment.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrderService } from '../services/order.service';

@Controller('admin/orders')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getAllOrders(@Query() query: QueryOrderDto) {
    return this.orderService.getAllOrders(query);
  }

  @Get(':id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrderById(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(id, dto);
  }

  @Patch(':id/payment')
  updatePayment(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderPaymentDto) {
    return this.orderService.updatePayment(id, dto);
  }
}
