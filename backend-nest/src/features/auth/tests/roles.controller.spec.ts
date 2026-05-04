import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../roles.controller';
import { RolesService } from '../roles.service';

const mockRolesService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockRole = { id: 1, name: 'admin' };

describe('RolesController', () => {
  let controller: RolesController;
  let service: ReturnType<typeof mockRolesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useFactory: mockRolesService }],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get(RolesService);
  });

  describe('GET /admin/roles — findAll', () => {
    it('should return list of roles', async () => {
      service.findAll.mockResolvedValue([mockRole]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockRole]);
    });

    it('should return empty array when no roles', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('GET /admin/roles/:id — findOne', () => {
    it('should return role by id', async () => {
      service.findOne.mockResolvedValue(mockRole);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRole);
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('Role #99 not found'));

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('POST /admin/roles — create', () => {
    it('should create and return new role', async () => {
      const dto = { name: 'customer' };
      const created = { id: 2, name: 'customer' };
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('PUT /admin/roles/:id — update', () => {
    it('should update and return role', async () => {
      const dto = { name: 'superadmin' };
      const updated = { id: 1, name: 'superadmin' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });

    it('should propagate NotFoundException when role not found', async () => {
      service.update.mockRejectedValue(new NotFoundException('Role #99 not found'));

      await expect(controller.update(99, { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('DELETE /admin/roles/:id — remove', () => {
    it('should call service.remove with correct id', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException when role not found', async () => {
      service.remove.mockRejectedValue(new NotFoundException('Role #99 not found'));

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
