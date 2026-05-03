import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface ListUsersFilter {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async list(filter: ListUsersFilter): Promise<[User[], number]> {
    const qb = this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .orderBy('user.id', 'DESC')
      .skip((filter.page - 1) * filter.limit)
      .take(filter.limit);

    if (filter.search) {
      qb.andWhere(
        '(user.email LIKE :s OR user.full_name LIKE :s)',
        { s: `%${filter.search}%` },
      );
    }
    if (typeof filter.isActive === 'boolean') {
      qb.andWhere('user.is_active = :active', { active: filter.isActive });
    }

    return qb.getManyAndCount();
  }

  findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email })
      .getOne();
  }

  emailExists(email: string): Promise<boolean> {
    return this.repo.exists({ where: { email } });
  }

  create(data: DeepPartial<User>): Promise<User> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: DeepPartial<User>): Promise<User | null> {
    await this.repo.update(id, data as object);
    return this.findById(id);
  }

  async remove(id: number): Promise<boolean> {
    const res = await this.repo.delete(id);
    return (res.affected ?? 0) > 0;
  }
}
