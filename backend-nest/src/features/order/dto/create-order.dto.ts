import { IsIn, IsInt, IsPositive } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  addressId: number;

  @IsIn(['cod', 'bank_transfer'])
  paymentMethod: string;
}
