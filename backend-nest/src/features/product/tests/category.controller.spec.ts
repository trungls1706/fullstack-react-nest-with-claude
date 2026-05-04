import { Test, TestingModule } from '@nestjs/testing';
import { AdminCategoryController } from '../controllers/admin-category.controller';
import { CategoryController } from '../controllers/category.controller';
import { Category } from '../entities/category.entity';
import { CategoryService, CategoryTree } from '../services/category.service';

const mockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 1,
  name: 'Electronics',
  slug: 'electronics',
  parentId: null,
  parent: null,
  children: [],
  ...overrides,
});

const mockTree = (): CategoryTree[] => [
  { id: 1, name: 'Electronics', slug: 'electronics', parentId: null, children: [] },
];

describe('CategoryController (public)', () => {
  let controller: CategoryController;
  let service: jest.Mocked<CategoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            findAllTree: jest.fn(),
            findBySlug: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get(CategoryService);
  });

  describe('findAll', () => {
    it('should return category tree', async () => {
      const tree = mockTree();
      service.findAllTree.mockResolvedValue(tree);

      const result = await controller.findAll();

      expect(service.findAllTree).toHaveBeenCalled();
      expect(result).toEqual(tree);
    });
  });

  describe('findOne', () => {
    it('should return a category by slug', async () => {
      const category = mockCategory();
      service.findBySlug.mockResolvedValue(category);

      const result = await controller.findOne('electronics');

      expect(service.findBySlug).toHaveBeenCalledWith('electronics');
      expect(result).toEqual(category);
    });
  });
});

describe('AdminCategoryController', () => {
  let controller: AdminCategoryController;
  let service: jest.Mocked<CategoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminCategoryController>(AdminCategoryController);
    service = module.get(CategoryService);
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto = { name: 'Electronics' };
      const category = mockCategory();
      service.create.mockResolvedValue(category);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(category);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const dto = { name: 'Updated' };
      const updated = { ...mockCategory(), name: 'Updated' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      service.remove.mockResolvedValue();

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
