import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Public } from '../../../shared/decorators/public.decorator';
import { ProductQueryDto } from '../dto/product-query.dto';
import { ProductVariantService } from '../services/product-variant.service';
import { ProductService } from '../services/product.service';

@Public()
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productVariantService: ProductVariantService,
  ) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    query.isActive = true;
    return this.productService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  @Get(':id/variants')
  findVariants(@Param('id', ParseIntPipe) id: number) {
    return this.productVariantService.findByProductId(id);
  }
}
