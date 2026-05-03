import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { RoleRepository } from '../repositories/role.repository';
import { Role } from '../entities/role.entity';

describe('RoleService', () => {
  let service: RoleService;
  let repo: jest.Mocked<RoleRepository>;

  const mockRole: Role = { id: 1, name: 'admin' };

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<RoleRepository>> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: RoleRepository, useValue: repoMock },
      ],
    }).compile();

    service = module.get(RoleService);
    repo = module.get(RoleRepository);
  });

  describe('findAll', () => {
    it('returns all roles', async () => {
      repo.findAll.mockResolvedValue([mockRole]);
      await expect(service.findAll()).resolves.toEqual([mockRole]);
      expect(repo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('returns role when found', async () => {
      repo.findById.mockResolvedValue(mockRole);
      await expect(service.findById(1)).resolves.toEqual(mockRole);
    });

    it('throws NotFoundException when missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findById(99)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates role when name unique', async () => {
      repo.findByName.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockRole);
      await expect(service.create({ name: 'admin' })).resolves.toEqual(mockRole);
      expect(repo.create).toHaveBeenCalledWith('admin');
    });

    it('throws ConflictException when name exists', async () => {
      repo.findByName.mockResolvedValue(mockRole);
      await expect(service.create({ name: 'admin' })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates role with new name', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.findByName.mockResolvedValue(null);
      const updated = { id: 1, name: 'manager' };
      repo.update.mockResolvedValue(updated);
      await expect(service.update(1, { name: 'manager' })).resolves.toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith(1, 'manager');
    });

    it('returns existing role when no name provided', async () => {
      repo.findById.mockResolvedValue(mockRole);
      await expect(service.update(1, {})).resolves.toEqual(mockRole);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when role missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update(99, { name: 'x' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ConflictException when new name belongs to another role', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.findByName.mockResolvedValue({ id: 2, name: 'manager' });
      await expect(service.update(1, { name: 'manager' })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('allows updating with same name (same id)', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.findByName.mockResolvedValue(mockRole);
      repo.update.mockResolvedValue(mockRole);
      await expect(service.update(1, { name: 'admin' })).resolves.toEqual(mockRole);
    });
  });

  describe('remove', () => {
    it('deletes existing role', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.remove.mockResolvedValue(true);
      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(repo.remove).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when role missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
