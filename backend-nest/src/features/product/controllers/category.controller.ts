import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../../shared/decorators/public.decorator';
import { CategoryService } from '../services/category.service';

@Public()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll() {
    return this.categoryService.findAllTree();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }
}
