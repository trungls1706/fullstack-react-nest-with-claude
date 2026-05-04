import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { getPaginationParams, paginate } from '../../../shared/utils/pagination.util';
import { PaginatedResult } from '../../../shared/types/pagination.type';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly productRepository: ProductRepository) {}

  async findAll(query: ProductQueryDto): Promise<PaginatedResult<Product>> {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const [data, total] = await this.productRepository.findAllPaginated({
      page,
      limit,
      categoryId: query.categoryId,
      search: query.search,
      isActive: query.isActive,
    });

    return paginate(data, total, page, limit);
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }
    return product;
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    this.logger.log(`Creating product: ${dto.name}`);

    const slug = dto.slug ?? this.toSlug(dto.name);

    const existing = await this.productRepository.findBySlugRaw(slug);
    if (existing) {
      throw new ConflictException(`Slug "${slug}" already exists`);
    }

    return this.productRepository.save({
      name: dto.name,
      slug,
      categoryId: dto.categoryId,
      description: dto.description ?? null,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      isActive: dto.isActive ?? true,
    });
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    if (dto.name && !dto.slug) {
      dto.slug = this.toSlug(dto.name);
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existing = await this.productRepository.findBySlugRaw(dto.slug);
      if (existing) {
        throw new ConflictException(`Slug "${dto.slug}" already exists`);
      }
    }

    return this.productRepository.save({ ...product, ...dto });
  }

  async softDelete(id: number): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    await this.productRepository.softDelete(id);
    this.logger.log(`Soft deleted product #${id}`);
  }

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
}
