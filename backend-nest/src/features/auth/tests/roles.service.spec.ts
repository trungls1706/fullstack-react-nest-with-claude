import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleRepository } from '../repositories/role.repository';
import { RolesService } from '../roles.service';

const mockRoleRepository = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockRole = { id: 1, name: 'admin' };

describe('RolesService', () => {
  let service: RolesService;
  let repo: ReturnType<typeof mockRoleRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RoleRepository, useFactory: mockRoleRepository },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repo = module.get(RoleRepository);
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      repo.findAll.mockResolvedValue([mockRole]);

      const result = await service.findAll();

      expect(repo.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockRole]);
    });

    it('should return empty array when no roles exist', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return role by id', async () => {
      repo.findById.mockResolvedValue(mockRole);

      const result = await service.findOne(1);

      expect(repo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException when role not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Role #99 not found');
    });
  });

  describe('create', () => {
    it('should create role successfully', async () => {
      const dto = { name: 'customer' };
      repo.findByName.mockResolvedValue(null);
      repo.save.mockResolvedValue({ id: 2, name: 'customer' });

      const result = await service.create(dto);

      expect(repo.findByName).toHaveBeenCalledWith('customer');
      expect(repo.save).toHaveBeenCalledWith({ name: 'customer' });
      expect(result).toEqual({ id: 2, name: 'customer' });
    });

    it('should throw ConflictException when role name already exists', async () => {
      const dto = { name: 'admin' };
      repo.findByName.mockResolvedValue(mockRole);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Role "admin" already exists',
      );
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update role successfully', async () => {
      const dto = { name: 'superadmin' };
      const updatedRole = { id: 1, name: 'superadmin' };
      repo.findById.mockResolvedValue({ ...mockRole });
      repo.findByName.mockResolvedValue(null);
      repo.save.mockResolvedValue(updatedRole);

      const result = await service.update(1, dto);

      expect(repo.findById).toHaveBeenCalledWith(1);
      expect(repo.findByName).toHaveBeenCalledWith('superadmin');
      expect(repo.save).toHaveBeenCalledWith({ id: 1, name: 'superadmin' });
      expect(result).toEqual(updatedRole);
    });

    it('should throw NotFoundException when role to update not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update(99, { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when new name conflicts with another role', async () => {
      const dto = { name: 'customer' };
      const conflictingRole = { id: 2, name: 'customer' };
      repo.findById.mockResolvedValue({ ...mockRole }); // id=1
      repo.findByName.mockResolvedValue(conflictingRole); // id=2 — conflict

      await expect(service.update(1, dto)).rejects.toThrow(ConflictException);
      await expect(service.update(1, dto)).rejects.toThrow(
        'Role "customer" already exists',
      );
    });

    it('should allow updating to the same name (no conflict with self)', async () => {
      const dto = { name: 'admin' };
      repo.findById.mockResolvedValue({ ...mockRole }); // id=1
      repo.findByName.mockResolvedValue(mockRole); // same id=1
      repo.save.mockResolvedValue({ id: 1, name: 'admin' });

      const result = await service.update(1, dto);

      expect(result).toEqual({ id: 1, name: 'admin' });
    });
  });

  describe('remove', () => {
    it('should delete role successfully', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repo.findById).toHaveBeenCalledWith(1);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when role to delete not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
