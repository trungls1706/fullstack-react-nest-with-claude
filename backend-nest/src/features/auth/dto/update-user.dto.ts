import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  fullName?: string;

  @IsOptional()
  @IsInt()
  roleId?: number;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
