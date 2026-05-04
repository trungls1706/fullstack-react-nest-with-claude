import { IsEnum } from 'class-validator';
import { PaymentStatus } from '../types/order-status.type';

export class UpdateOrderPaymentDto {
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}
