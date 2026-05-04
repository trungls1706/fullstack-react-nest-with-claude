import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';

export interface CategoryTree extends Omit<Category, 'children' | 'parent'> {
  children: CategoryTree[];
}

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAllTree(): Promise<CategoryTree[]> {
    const all = await this.categoryRepository.findAll();
    return this.buildTree(all);
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    this.logger.log(`Creating category: ${dto.name}`);

    const slug = dto.slug ?? this.toSlug(dto.name);

    const existing = await this.categoryRepository.findBySlugRaw(slug);
    if (existing) {
      throw new ConflictException(`Slug "${slug}" already exists`);
    }

    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent category #${dto.parentId} not found`);
      }
    }

    return this.categoryRepository.save({ name: dto.name, slug, parentId: dto.parentId ?? null });
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepository.findBySlugRaw(dto.slug);
      if (existing) {
        throw new ConflictException(`Slug "${dto.slug}" already exists`);
      }
    }

    if (dto.name && !dto.slug) {
      dto.slug = this.toSlug(dto.name);
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      if (dto.parentId !== null) {
        const parent = await this.categoryRepository.findById(dto.parentId);
        if (!parent) {
          throw new NotFoundException(`Parent category #${dto.parentId} not found`);
        }
      }
    }

    return this.categoryRepository.save({ ...category, ...dto });
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    await this.categoryRepository.delete(id);
    this.logger.log(`Deleted category #${id}`);
  }

  private buildTree(categories: Category[], parentId: number | null = null): CategoryTree[] {
    return categories
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        ...c,
        children: this.buildTree(categories, c.id),
      }));
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
