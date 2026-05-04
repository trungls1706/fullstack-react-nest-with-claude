import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  findAll(): Promise<Role[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  findById(id: number): Promise<Role | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Role | null> {
    return this.repo.findOne({ where: { name } });
  }

  save(role: Partial<Role>): Promise<Role> {
    return this.repo.save(role);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
