import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ListUsersDto } from '../dto/list-users.dto';

@ApiTags('users')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('admin/users')
  list(@Query() query: ListUsersDto) {
    return this.userService.list(query);
  }

  @Get('admin/users/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Post('admin/users')
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch('admin/users/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  @Delete('admin/users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
