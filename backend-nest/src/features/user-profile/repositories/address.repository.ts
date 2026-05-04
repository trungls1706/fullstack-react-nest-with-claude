import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/address.entity';

@Injectable()
export class AddressRepository {
  constructor(
    @InjectRepository(Address)
    private readonly repo: Repository<Address>,
  ) {}

  findAllByUserId(userId: number): Promise<Address[]> {
    return this.repo.find({ where: { userId }, order: { isDefault: 'DESC', id: 'ASC' } });
  }

  findOneByIdAndUserId(id: number, userId: number): Promise<Address | null> {
    return this.repo.findOne({ where: { id, userId } });
  }

  save(address: Partial<Address>): Promise<Address> {
    return this.repo.save(address);
  }

  async clearDefaultForUser(userId: number): Promise<void> {
    await this.repo.update({ userId, isDefault: true }, { isDefault: false });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
