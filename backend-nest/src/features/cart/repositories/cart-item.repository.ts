import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartItemRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly repo: Repository<CartItem>,
  ) {}

  findByCartIdAndVariantId(cartId: number, productVariantId: number): Promise<CartItem | null> {
    return this.repo.findOne({ where: { cartId, productVariantId } });
  }

  findById(id: number): Promise<CartItem | null> {
    return this.repo.findOne({ where: { id }, relations: ['cart'] });
  }

  save(item: Partial<CartItem>): Promise<CartItem> {
    return this.repo.save(item);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async deleteByCartId(cartId: number): Promise<void> {
    await this.repo.delete({ cartId });
  }
}
