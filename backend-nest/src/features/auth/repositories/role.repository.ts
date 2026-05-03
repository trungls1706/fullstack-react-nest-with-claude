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

  create(name: string): Promise<Role> {
    return this.repo.save(this.repo.create({ name }));
  }

  async update(id: number, name: string): Promise<Role | null> {
    await this.repo.update(id, { name });
    return this.findById(id);
  }

  async remove(id: number): Promise<boolean> {
    const res = await this.repo.delete(id);
    return (res.affected ?? 0) > 0;
  }
}
