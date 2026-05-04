import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface FindAllUsersOptions {
  page: number;
  limit: number;
  isActive?: boolean;
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findAllPaginated(
    options: FindAllUsersOptions,
  ): Promise<[User[], number]> {
    const { page, limit, isActive } = options;

    const qb = this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .orderBy('user.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    return qb.getManyAndCount();
  }

  findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id }, relations: ['role'] });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  save(user: Partial<User>): Promise<User> {
    return this.repo.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
