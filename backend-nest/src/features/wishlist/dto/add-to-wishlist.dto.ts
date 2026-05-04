import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AddToWishlistDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  productId: number;
}
