import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  addressLine: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
