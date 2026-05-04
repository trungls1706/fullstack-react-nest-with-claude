import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity';

@Injectable()
export class ProductVariantRepository {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly repo: Repository<ProductVariant>,
  ) {}

  findByProductId(productId: number): Promise<ProductVariant[]> {
    return this.repo.find({ where: { productId }, order: { id: 'ASC' } });
  }

  findById(id: number): Promise<ProductVariant | null> {
    return this.repo.findOne({ where: { id }, relations: ['product'] });
  }

  findBySku(sku: string): Promise<ProductVariant | null> {
    return this.repo.findOne({ where: { sku } });
  }

  save(variant: Partial<ProductVariant>): Promise<ProductVariant> {
    return this.repo.save(variant);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
