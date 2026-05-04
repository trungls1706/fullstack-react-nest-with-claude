import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Public } from '../../../shared/decorators/public.decorator';
import { ProductVariantService } from '../services/product-variant.service';

@Public()
@Controller('variants')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productVariantService.findById(id);
  }
}
