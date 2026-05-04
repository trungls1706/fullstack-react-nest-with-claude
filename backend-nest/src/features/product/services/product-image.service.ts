import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProductImage } from '../entities/product-image.entity';
import { ProductImageRepository } from '../repositories/product-image.repository';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductImageService {
  private readonly logger = new Logger(ProductImageService.name);

  constructor(
    private readonly imageRepository: ProductImageRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async uploadImages(
    productId: number,
    files: Express.Multer.File[],
    baseUrl: string,
  ): Promise<ProductImage[]> {
    this.logger.log(`Uploading ${files.length} images for product #${productId}`);

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }

    const existingImages = await this.imageRepository.findByProductId(productId);
    const startOrder = existingImages.length;

    const images = files.map((file, index) => ({
      productId,
      imageUrl: `${baseUrl}/uploads/products/${file.filename}`,
      sortOrder: startOrder + index,
    }));

    return this.imageRepository.saveMany(images);
  }

  async delete(id: number): Promise<void> {
    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw new NotFoundException(`Image #${id} not found`);
    }
    await this.imageRepository.delete(id);
    this.logger.log(`Deleted image #${id}`);
  }
}
