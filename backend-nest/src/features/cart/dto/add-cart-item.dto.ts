import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddCartItemDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  productVariantId: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number = 1;
}
