import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminCategoryController } from './controllers/admin-category.controller';
import { AdminProductController } from './controllers/admin-product.controller';
import { CategoryController } from './controllers/category.controller';
import { ProductController } from './controllers/product.controller';
import { ProductVariantController } from './controllers/product-variant.controller';
import { Category } from './entities/category.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { CategoryRepository } from './repositories/category.repository';
import { ProductImageRepository } from './repositories/product-image.repository';
import { ProductVariantRepository } from './repositories/product-variant.repository';
import { ProductRepository } from './repositories/product.repository';
import { CategoryService } from './services/category.service';
import { ProductImageService } from './services/product-image.service';
import { ProductVariantService } from './services/product-variant.service';
import { ProductService } from './services/product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product, ProductVariant, ProductImage]),
    MulterModule.register({ dest: './uploads/products' }),
  ],
  controllers: [
    CategoryController,
    AdminCategoryController,
    ProductController,
    ProductVariantController,
    AdminProductController,
  ],
  providers: [
    CategoryService,
    CategoryRepository,
    ProductService,
    ProductRepository,
    ProductVariantService,
    ProductVariantRepository,
    ProductImageService,
    ProductImageRepository,
  ],
  exports: [
    CategoryService,
    CategoryRepository,
    ProductService,
    ProductRepository,
    ProductVariantService,
    ProductVariantRepository,
  ],
})
export class ProductModule {}
