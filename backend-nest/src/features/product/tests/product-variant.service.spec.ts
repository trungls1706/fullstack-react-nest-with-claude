import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductRepository } from '../repositories/product.repository';
import { ProductVariantRepository } from '../repositories/product-variant.repository';
import { ProductVariantService } from '../services/product-variant.service';

const mockProduct = (): Product =>
  ({ id: 1, name: 'Ao thun', slug: 'ao-thun', isActive: true }) as Product;

const mockVariant = (overrides: Partial<ProductVariant> = {}): ProductVariant => ({
  id: 1,
  productId: 1,
  product: null as any,
  sku: 'ATN-WHITE-L',
  color: 'white',
  size: 'L',
  price: 250000,
  salePrice: null,
  stockQuantity: 10,
  ...overrides,
});

describe('ProductVariantService', () => {
  let service: ProductVariantService;
  let variantRepository: jest.Mocked<ProductVariantRepository>;
  let productRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantService,
        {
          provide: ProductVariantRepository,
          useValue: {
            findByProductId: jest.fn(),
            findById: jest.fn(),
            findBySku: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ProductRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductVariantService>(ProductVariantService);
    variantRepository = module.get(ProductVariantRepository);
    productRepository = module.get(ProductRepository);
  });

  describe('findByProductId', () => {
    it('should return variants for a product', async () => {
      productRepository.findById.mockResolvedValue(mockProduct());
      const variants = [mockVariant()];
      variantRepository.findByProductId.mockResolvedValue(variants);

      const result = await service.findByProductId(1);

      expect(result).toEqual(variants);
    });

    it('should throw NotFoundException when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);
      await expect(service.findByProductId(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a variant', async () => {
      const variant = mockVariant();
      variantRepository.findById.mockResolvedValue(variant);

      const result = await service.findById(1);

      expect(result).toEqual(variant);
    });

    it('should throw NotFoundException when not found', async () => {
      variantRepository.findById.mockResolvedValue(null);
      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a variant', async () => {
      const dto = { sku: 'ATN-BLACK-M', price: 200000 };
      const saved = mockVariant({ sku: 'ATN-BLACK-M', price: 200000 });
      productRepository.findById.mockResolvedValue(mockProduct());
      variantRepository.findBySku.mockResolvedValue(null);
      variantRepository.save.mockResolvedValue(saved);

      const result = await service.create(1, dto);

      expect(result.sku).toBe('ATN-BLACK-M');
    });

    it('should throw NotFoundException when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);
      await expect(service.create(99, { sku: 'X', price: 100 })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when SKU already exists', async () => {
      productRepository.findById.mockResolvedValue(mockProduct());
      variantRepository.findBySku.mockResolvedValue(mockVariant());
      await expect(service.create(1, { sku: 'ATN-WHITE-L', price: 100 })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update a variant', async () => {
      const variant = mockVariant();
      variantRepository.findById.mockResolvedValue(variant);
      variantRepository.findBySku.mockResolvedValue(null);
      variantRepository.save.mockResolvedValue({ ...variant, price: 300000 });

      const result = await service.update(1, { price: 300000 });

      expect(result.price).toBe(300000);
    });

    it('should throw NotFoundException when variant not found', async () => {
      variantRepository.findById.mockResolvedValue(null);
      await expect(service.update(99, { price: 100 })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new SKU already taken', async () => {
      variantRepository.findById.mockResolvedValue(mockVariant());
      variantRepository.findBySku.mockResolvedValue(mockVariant({ id: 2, sku: 'OTHER-SKU' }));
      await expect(service.update(1, { sku: 'OTHER-SKU' })).rejects.toThrow(ConflictException);
    });
  });
});
