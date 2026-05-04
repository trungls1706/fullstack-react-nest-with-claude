import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateProductDto } from '../dto/create-product.dto';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';
import { ProductImageService } from '../services/product-image.service';
import { ProductVariantService } from '../services/product-variant.service';
import { ProductService } from '../services/product.service';

const imageStorage = diskStorage({
  destination: './uploads/products',
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpeg, png, webp images are allowed'), false);
  }
};

@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productVariantService: ProductVariantService,
    private readonly productImageService: ProductImageService,
  ) { }

  // ── Products ──────────────────────────────────────────────────────────────

  @Get('products')
  getAllProducts(@Query() query: ProductQueryDto) {
    if (query.isActive === undefined) {
      query.isActive = true;
    }
    return this.productService.findAll(query);
  }

  @Get('products/:id')
  getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findById(id);
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.softDelete(id);
  }

  // ── Variants ──────────────────────────────────────────────────────────────

  @Post('products/:id/variants')
  createVariant(
    @Param('id', ParseIntPipe) productId: number,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.productVariantService.create(productId, dto);
  }

  @Patch('variants/:id')
  updateVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.productVariantService.update(id, dto);
  }

  // ── Images ────────────────────────────────────────────────────────────────

  @Post('products/:id/images')
  @UseInterceptors(
    FilesInterceptor('files', 10, { storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  uploadImages(
    @Param('id', ParseIntPipe) productId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.productImageService.uploadImages(productId, files, baseUrl);
  }

  @Delete('images/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImage(@Param('id', ParseIntPipe) id: number) {
    return this.productImageService.delete(id);
  }
}
