import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ListUsersDto } from '../dto/list-users.dto';
import { RoleService } from './role.service';
import { hashPassword } from '../../../shared/utils/hash.util';
import { buildPaginationMeta } from '../../../shared/utils/pagination.util';
import { PaginationMeta } from '../../../shared/types/response.type';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly roleService: RoleService,
  ) {}

  async list(query: ListUsersDto): Promise<{ data: User[]; meta: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [data, total] = await this.userRepo.list({
      page,
      limit,
      search: query.search,
      isActive: query.isActive ? query.isActive === 'true' : undefined,
    });
    return { data, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_001',
        message: `User #${id} not found`,
      });
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    if (await this.userRepo.emailExists(dto.email)) {
      throw new ConflictException({
        code: 'AUTH_005',
        message: 'Email already exists',
      });
    }
    await this.roleService.findById(dto.roleId);
    const passwordHash = await hashPassword(dto.password);
    this.logger.log(`Creating user ${dto.email}`);
    return this.userRepo.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      roleId: dto.roleId,
      phone: dto.phone ?? null,
      isActive: dto.isActive ?? true,
    });
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);

    if (dto.email) {
      const existing = await this.userRepo.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException({
          code: 'AUTH_005',
          message: 'Email already exists',
        });
      }
    }
    if (dto.roleId) {
      await this.roleService.findById(dto.roleId);
    }

    const patch: Partial<User> = {};
    if (dto.email) patch.email = dto.email;
    if (dto.fullName) patch.fullName = dto.fullName;
    if (dto.roleId) patch.roleId = dto.roleId;
    if (dto.phone !== undefined) patch.phone = dto.phone;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;
    if (dto.password) patch.passwordHash = await hashPassword(dto.password);

    const updated = await this.userRepo.update(id, patch);
    return updated as User;
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.userRepo.remove(id);
    this.logger.log(`Deleted user #${id}`);
  }
}
