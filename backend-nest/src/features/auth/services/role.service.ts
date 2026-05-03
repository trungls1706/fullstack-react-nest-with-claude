import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private readonly roleRepo: RoleRepository) {}

  findAll(): Promise<Role[]> {
    return this.roleRepo.findAll();
  }

  async findById(id: number): Promise<Role> {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException({
        code: 'ROLE_001',
        message: `Role #${id} not found`,
      });
    }
    return role;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException({
        code: 'ROLE_002',
        message: `Role name "${dto.name}" already exists`,
      });
    }
    this.logger.log(`Creating role ${dto.name}`);
    return this.roleRepo.create(dto.name);
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    await this.findById(id);
    if (dto.name) {
      const dup = await this.roleRepo.findByName(dto.name);
      if (dup && dup.id !== id) {
        throw new ConflictException({
          code: 'ROLE_002',
          message: `Role name "${dto.name}" already exists`,
        });
      }
    }
    if (!dto.name) return this.findById(id);
    const updated = await this.roleRepo.update(id, dto.name);
    return updated as Role;
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.roleRepo.remove(id);
    this.logger.log(`Deleted role #${id}`);
  }
}
