import { IsEnum } from 'class-validator';
import { OrderStatus } from '../types/order-status.type';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
