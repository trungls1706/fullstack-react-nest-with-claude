import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { UsersService } from '../users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

const mockUserRepository = () => ({
  findAllPaginated: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockRole = { id: 1, name: 'customer' };
const mockUser = {
  id: 1,
  email: 'user@test.com',
  passwordHash: 'hashed_password',
  fullName: 'Test User',
  phone: null,
  roleId: 1,
  role: mockRole,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: ReturnType<typeof mockUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(UserRepository);
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated users with meta', async () => {
      repo.findAllPaginated.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockUser]);
      expect(result.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });

    it('should pass isActive filter to repository', async () => {
      repo.findAllPaginated.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10, isActive: false });

      expect(repo.findAllPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('should return empty data when no users', async () => {
      repo.findAllPaginated.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return user by id', async () => {
      repo.findById.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(repo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('User #99 not found');
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    const createDto = {
      email: 'new@test.com',
      password: 'password123',
      fullName: 'New User',
      roleId: 1,
    };

    it('should create user with hashed password', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.save.mockResolvedValue({ ...mockUser, id: 2, email: 'new@test.com' });

      const result = await service.create(createDto);

      expect(repo.findByEmail).toHaveBeenCalledWith('new@test.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@test.com',
          passwordHash: 'hashed_password',
          fullName: 'New User',
          roleId: 1,
          isActive: true,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw ConflictException when email already exists', async () => {
      repo.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow(
        `Email "${createDto.email}" already exists`,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update user fields', async () => {
      const existingUser = { ...mockUser };
      repo.findById.mockResolvedValue(existingUser);
      repo.save.mockResolvedValue({ ...existingUser, fullName: 'Updated Name' });

      const result = await service.update(1, { fullName: 'Updated Name' });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: 'Updated Name' }),
      );
      expect(result.fullName).toBe('Updated Name');
    });

    it('should throw NotFoundException when user not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update(99, { fullName: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── toggleActive ───────────────────────────────────────────────────────────

  describe('toggleActive', () => {
    it('should toggle isActive from true to false', async () => {
      repo.findById.mockResolvedValue({ ...mockUser, isActive: true });
      repo.save.mockResolvedValue({ ...mockUser, isActive: false });

      const result = await service.toggleActive(1);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
      expect(result.isActive).toBe(false);
    });

    it('should toggle isActive from false to true', async () => {
      repo.findById.mockResolvedValue({ ...mockUser, isActive: false });
      repo.save.mockResolvedValue({ ...mockUser, isActive: true });

      const result = await service.toggleActive(1);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
      expect(result.isActive).toBe(true);
    });

    it('should throw NotFoundException when user not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.toggleActive(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete user successfully', async () => {
      repo.findById.mockResolvedValue(mockUser);
      repo.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
