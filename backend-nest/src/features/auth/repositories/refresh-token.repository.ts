import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {}

  findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.repo.findOne({
      where: { tokenHash, isRevoked: false },
      relations: ['user', 'user.role'],
    });
  }

  create(data: Partial<RefreshToken>): Promise<RefreshToken> {
    return this.repo.save(data);
  }

  async revoke(tokenHash: string): Promise<void> {
    await this.repo.update({ tokenHash }, { isRevoked: true });
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.repo.update({ userId }, { isRevoked: true });
  }
}
