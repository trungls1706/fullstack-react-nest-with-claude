import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Length(2, 100)
  fullName: string;

  @IsInt()
  roleId: number;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
