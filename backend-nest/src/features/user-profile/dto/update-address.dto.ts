import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fullName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  addressLine?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
