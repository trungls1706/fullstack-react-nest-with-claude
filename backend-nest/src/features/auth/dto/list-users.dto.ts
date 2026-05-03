import { IsBooleanString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/types/pagination.type';

export class ListUsersDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}
