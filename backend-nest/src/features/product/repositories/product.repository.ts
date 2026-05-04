import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

export interface FindProductsOptions {
  page: number;
  limit: number;
  categoryId?: number;
  search?: string;
  isActive?: boolean;
}

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async findAllPaginated(options: FindProductsOptions): Promise<[Product[], number]> {
    const { page, limit, categoryId, search } = options;

    const qb = this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.variants', 'variant')
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (options.isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', { isActive: options.isActive });
    }

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (search) {
      qb.andWhere('product.name LIKE :search', { search: `%${search}%` });
    }

    return qb.getManyAndCount();
  }

  findBySlug(slug: string): Promise<Product | null> {
    return this.repo.findOne({
      where: { slug, isActive: true },
      relations: ['category', 'variants', 'images'],
    });
  }

  findById(id: number): Promise<Product | null> {
    return this.repo.findOne({ where: { id }, relations: ['category', 'variants', 'images'] });
  }

  findBySlugRaw(slug: string): Promise<Product | null> {
    return this.repo.findOne({ where: { slug } });
  }

  save(product: Partial<Product>): Promise<Product> {
    return this.repo.save(product);
  }

  async softDelete(id: number): Promise<void> {
    await this.repo.update(id, { isActive: false });
  }
}
