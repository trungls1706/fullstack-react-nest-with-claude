import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

const mockUsersService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  toggleActive: jest.fn(),
  remove: jest.fn(),
});

const mockUser = {
  id: 1,
  email: 'user@test.com',
  fullName: 'Test User',
  phone: null,
  roleId: 1,
  isActive: true,
};

const mockPaginated = {
  data: [mockUser],
  meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: ReturnType<typeof mockUsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useFactory: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  describe('GET /admin/users — findAll', () => {
    it('should return paginated users', async () => {
      service.findAll.mockResolvedValue(mockPaginated);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(mockPaginated);
    });

    it('should pass isActive filter to service', async () => {
      service.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll({ page: 1, limit: 10, isActive: true });

      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });
  });

  describe('GET /admin/users/:id — findOne', () => {
    it('should return user by id', async () => {
      service.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should propagate NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('User #99 not found'));

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('POST /admin/users — create', () => {
    it('should create and return new user', async () => {
      const dto = {
        email: 'new@test.com',
        password: 'password123',
        fullName: 'New User',
        roleId: 1,
      };
      service.create.mockResolvedValue({ id: 2, ...dto });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBeDefined();
    });
  });

  describe('PATCH /admin/users/:id — update', () => {
    it('should update and return user', async () => {
      const dto = { fullName: 'Updated' };
      service.update.mockResolvedValue({ ...mockUser, fullName: 'Updated' });

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.fullName).toBe('Updated');
    });

    it('should propagate NotFoundException', async () => {
      service.update.mockRejectedValue(new NotFoundException('User #99 not found'));

      await expect(controller.update(99, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /admin/users/:id/toggle-active — toggleActive', () => {
    it('should toggle user active status', async () => {
      service.toggleActive.mockResolvedValue({ ...mockUser, isActive: false });

      const result = await controller.toggleActive(1);

      expect(service.toggleActive).toHaveBeenCalledWith(1);
      expect(result.isActive).toBe(false);
    });

    it('should propagate NotFoundException', async () => {
      service.toggleActive.mockRejectedValue(
        new NotFoundException('User #99 not found'),
      );

      await expect(controller.toggleActive(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /admin/users/:id — remove', () => {
    it('should call service.remove with correct id', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException', async () => {
      service.remove.mockRejectedValue(new NotFoundException('User #99 not found'));

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
