import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductRepository } from '../repositories/product.repository';
import { ProductVariantRepository } from '../repositories/product-variant.repository';

@Injectable()
export class ProductVariantService {
  private readonly logger = new Logger(ProductVariantService.name);

  constructor(
    private readonly variantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async findByProductId(productId: number): Promise<ProductVariant[]> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }
    return this.variantRepository.findByProductId(productId);
  }

  async findById(id: number): Promise<ProductVariant> {
    const variant = await this.variantRepository.findById(id);
    if (!variant) {
      throw new NotFoundException(`Variant #${id} not found`);
    }
    return variant;
  }

  async create(productId: number, dto: CreateProductVariantDto): Promise<ProductVariant> {
    this.logger.log(`Creating variant for product #${productId}: ${dto.sku}`);

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }

    const existing = await this.variantRepository.findBySku(dto.sku);
    if (existing) {
      throw new ConflictException(`SKU "${dto.sku}" already exists`);
    }

    return this.variantRepository.save({
      productId,
      sku: dto.sku,
      color: dto.color ?? null,
      size: dto.size ?? null,
      price: dto.price,
      salePrice: dto.salePrice ?? null,
      stockQuantity: dto.stockQuantity ?? 0,
    });
  }

  async update(id: number, dto: UpdateProductVariantDto): Promise<ProductVariant> {
    const variant = await this.variantRepository.findById(id);
    if (!variant) {
      throw new NotFoundException(`Variant #${id} not found`);
    }

    if (dto.sku && dto.sku !== variant.sku) {
      const existing = await this.variantRepository.findBySku(dto.sku);
      if (existing) {
        throw new ConflictException(`SKU "${dto.sku}" already exists`);
      }
    }

    return this.variantRepository.save({ ...variant, ...dto });
  }
}
