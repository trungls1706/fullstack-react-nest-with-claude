import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async findAll(query: QueryUserDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [data, total] = await this.userRepository.findAllPaginated({
      page,
      limit,
      isActive: query.isActive,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${dto.email}`);

    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`Email "${dto.email}" already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.userRepository.save({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
      roleId: dto.roleId,
      isActive: true,
    });
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.phone !== undefined) user.phone = dto.phone ?? null;
    if (dto.roleId !== undefined) user.roleId = dto.roleId;

    return this.userRepository.save(user);
  }

  async toggleActive(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    this.logger.log(`User #${id} isActive set to ${user.isActive}`);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.userRepository.delete(id);
    this.logger.log(`Deleted user #${id}`);
  }
}
