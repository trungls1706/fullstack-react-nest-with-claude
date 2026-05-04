import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Product } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { ProductService } from '../services/product.service';

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  name: 'Ao thun nam',
  slug: 'ao-thun-nam',
  categoryId: 1,
  category: null as any,
  description: null,
  thumbnailUrl: null,
  isActive: true,
  variants: [],
  images: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ProductService', () => {
  let service: ProductService;
  let repository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            findAllPaginated: jest.fn(),
            findBySlug: jest.fn(),
            findById: jest.fn(),
            findBySlugRaw: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get(ProductRepository);
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const products = [mockProduct()];
      repository.findAllPaginated.mockResolvedValue([products, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(products);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should pass filters to repository', async () => {
      repository.findAllPaginated.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10, categoryId: 5, search: 'ao' });

      expect(repository.findAllPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 5, search: 'ao' }),
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a product by slug', async () => {
      const product = mockProduct();
      repository.findBySlug.mockResolvedValue(product);

      const result = await service.findBySlug('ao-thun-nam');

      expect(result).toEqual(product);
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findBySlug.mockResolvedValue(null);
      await expect(service.findBySlug('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a product with auto-generated slug', async () => {
      const dto = { name: 'Ao thun nam', categoryId: 1 };
      const saved = mockProduct();
      repository.findBySlugRaw.mockResolvedValue(null);
      repository.save.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'ao-thun-nam' }),
      );
      expect(result).toEqual(saved);
    });

    it('should throw ConflictException when slug exists', async () => {
      repository.findBySlugRaw.mockResolvedValue(mockProduct());
      await expect(service.create({ name: 'Ao thun nam', categoryId: 1 })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const product = mockProduct();
      repository.findById.mockResolvedValue(product);
      repository.findBySlugRaw.mockResolvedValue(null);
      repository.save.mockResolvedValue({ ...product, name: 'Updated' });

      const result = await service.update(1, { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when product not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.update(99, { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new slug already taken', async () => {
      repository.findById.mockResolvedValue(mockProduct());
      repository.findBySlugRaw.mockResolvedValue(mockProduct({ id: 2, slug: 'taken' }));
      await expect(service.update(1, { slug: 'taken' })).rejects.toThrow(ConflictException);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a product', async () => {
      repository.findById.mockResolvedValue(mockProduct());

      await service.softDelete(1);

      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when product not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.softDelete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
