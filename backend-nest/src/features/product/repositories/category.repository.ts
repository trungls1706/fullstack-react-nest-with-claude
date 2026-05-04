import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.repo.find({ relations: ['children', 'parent'] });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.repo.findOne({
      where: { slug },
      relations: ['children', 'parent'],
    });
  }

  findById(id: number): Promise<Category | null> {
    return this.repo.findOne({ where: { id }, relations: ['children', 'parent'] });
  }

  findBySlugRaw(slug: string): Promise<Category | null> {
    return this.repo.findOne({ where: { slug } });
  }

  save(category: Partial<Category>): Promise<Category> {
    return this.repo.save(category);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
