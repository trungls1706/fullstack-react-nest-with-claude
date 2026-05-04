import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { Category } from '../entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryService } from '../services/category.service';

const mockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 1,
  name: 'Electronics',
  slug: 'electronics',
  parentId: null,
  parent: null,
  children: [],
  ...overrides,
});

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: jest.Mocked<CategoryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: {
            findAll: jest.fn(),
            findBySlug: jest.fn(),
            findById: jest.fn(),
            findBySlugRaw: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get(CategoryRepository);
  });

  describe('findAllTree', () => {
    it('should return a tree of categories', async () => {
      const parent = mockCategory({ id: 1, parentId: null });
      const child = mockCategory({ id: 2, name: 'Phones', slug: 'phones', parentId: 1 });
      repository.findAll.mockResolvedValue([parent, child]);

      const result = await service.findAllTree();

      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].slug).toBe('phones');
    });

    it('should return empty array when no categories', async () => {
      repository.findAll.mockResolvedValue([]);
      const result = await service.findAllTree();
      expect(result).toEqual([]);
    });
  });

  describe('findBySlug', () => {
    it('should return a category by slug', async () => {
      const category = mockCategory();
      repository.findBySlug.mockResolvedValue(category);

      const result = await service.findBySlug('electronics');

      expect(repository.findBySlug).toHaveBeenCalledWith('electronics');
      expect(result).toEqual(category);
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findBySlug.mockResolvedValue(null);
      await expect(service.findBySlug('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a category with auto-generated slug', async () => {
      const dto: CreateCategoryDto = { name: 'My Category' };
      const saved = mockCategory({ name: 'My Category', slug: 'my-category' });
      repository.findBySlugRaw.mockResolvedValue(null);
      repository.save.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith({
        name: 'My Category',
        slug: 'my-category',
        parentId: null,
      });
      expect(result.slug).toBe('my-category');
    });

    it('should use provided slug over auto-generated', async () => {
      const dto: CreateCategoryDto = { name: 'My Category', slug: 'custom-slug' };
      repository.findBySlugRaw.mockResolvedValue(null);
      repository.save.mockResolvedValue(mockCategory({ slug: 'custom-slug' }));

      await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'custom-slug' }),
      );
    });

    it('should throw ConflictException when slug already exists', async () => {
      repository.findBySlugRaw.mockResolvedValue(mockCategory());
      await expect(service.create({ name: 'Electronics' })).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when parentId does not exist', async () => {
      repository.findBySlugRaw.mockResolvedValue(null);
      repository.findById.mockResolvedValue(null);

      await expect(service.create({ name: 'Child', parentId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const category = mockCategory();
      const updated = { ...category, name: 'Updated' };
      repository.findById.mockResolvedValue(category);
      repository.findBySlugRaw.mockResolvedValue(null);
      repository.save.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when category not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.update(99, { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new slug already taken', async () => {
      repository.findById.mockResolvedValue(mockCategory());
      repository.findBySlugRaw.mockResolvedValue(mockCategory({ id: 2, slug: 'taken' }));

      await expect(service.update(1, { slug: 'taken' })).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when setting itself as parent', async () => {
      repository.findById.mockResolvedValue(mockCategory({ id: 1 }));
      await expect(service.update(1, { parentId: 1 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      repository.findById.mockResolvedValue(mockCategory());

      await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when category not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
