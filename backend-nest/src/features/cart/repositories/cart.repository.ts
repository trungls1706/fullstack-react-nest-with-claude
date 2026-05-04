import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly repo: Repository<Cart>,
  ) {}

  findByUserId(userId: number): Promise<Cart | null> {
    return this.repo.findOne({
      where: { userId },
      relations: ['items', 'items.productVariant', 'items.productVariant.product'],
    });
  }

  findBySessionId(sessionId: string): Promise<Cart | null> {
    return this.repo.findOne({
      where: { sessionId },
      relations: ['items', 'items.productVariant', 'items.productVariant.product'],
    });
  }

  findById(id: number): Promise<Cart | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['items', 'items.productVariant', 'items.productVariant.product'],
    });
  }

  save(cart: Partial<Cart>): Promise<Cart> {
    return this.repo.save(cart);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
