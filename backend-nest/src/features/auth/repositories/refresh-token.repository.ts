import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {}

  create(data: DeepPartial<RefreshToken>): Promise<RefreshToken> {
    return this.repo.save(this.repo.create(data));
  }

  findActiveByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.repo.findOne({
      where: { tokenHash, isRevoked: false },
      relations: ['user', 'user.role'],
    });
  }

  async revokeById(id: number): Promise<void> {
    await this.repo.update(id, { isRevoked: true });
  }

  async revokeByHash(tokenHash: string): Promise<void> {
    await this.repo.update({ tokenHash }, { isRevoked: true });
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.repo.update({ userId, isRevoked: false }, { isRevoked: true });
  }
}
