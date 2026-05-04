import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { RoleRepository } from '../repositories/role.repository';
import { UserRepository } from '../repositories/user.repository';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

const mockUserRepository = () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
});

const mockRoleRepository = () => ({
  findByName: jest.fn(),
});

const mockRefreshTokenRepository = () => ({
  create: jest.fn(),
  findByTokenHash: jest.fn(),
  revoke: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('signed_token'),
});

const mockConfigService = () => ({
  get: jest.fn().mockReturnValue('7d'),
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

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: ReturnType<typeof mockUserRepository>;
  let roleRepo: ReturnType<typeof mockRoleRepository>;
  let refreshRepo: ReturnType<typeof mockRefreshTokenRepository>;
  let jwtService: ReturnType<typeof mockJwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: RoleRepository, useFactory: mockRoleRepository },
        { provide: RefreshTokenRepository, useFactory: mockRefreshTokenRepository },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(UserRepository);
    roleRepo = module.get(RoleRepository);
    refreshRepo = module.get(RefreshTokenRepository);
    jwtService = module.get(JwtService);
  });

  // ─── register ───────────────────────────────────────────────────────────────

  describe('register', () => {
    const registerDto = {
      email: 'new@test.com',
      password: 'password123',
      fullName: 'New User',
    };

    it('should register user with customer role', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      roleRepo.findByName.mockResolvedValue(mockRole);
      userRepo.save.mockResolvedValue({ ...mockUser, id: 2, email: registerDto.email });

      const result = await service.register(registerDto);

      expect(roleRepo.findByName).toHaveBeenCalledWith('customer');
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          passwordHash: 'hashed_password',
          roleId: mockRole.id,
          isActive: true,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when customer role not found', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      roleRepo.findByName.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    const loginDto = { email: 'user@test.com', password: 'password123' };

    it('should return accessToken, refreshToken and user on success', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser);
      userRepo.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      refreshRepo.create.mockResolvedValue({});

      const result = await service.login(loginDto, {});

      expect(result.accessToken).toBe('signed_token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(refreshRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUser.id }),
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto, {})).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto, {})).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      userRepo.findByEmail.mockResolvedValue({ ...mockUser, isActive: false });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto, {})).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── refresh ────────────────────────────────────────────────────────────────

  describe('refresh', () => {
    const rawToken = 'valid_raw_token';
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    it('should return new accessToken on valid refresh token', async () => {
      refreshRepo.findByTokenHash.mockResolvedValue({
        user: mockUser,
        expiresAt: futureDate,
      });

      const result = await service.refresh(rawToken);

      expect(result.accessToken).toBe('signed_token');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token not found', async () => {
      refreshRepo.findByTokenHash.mockResolvedValue(null);

      await expect(service.refresh(rawToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token expired', async () => {
      refreshRepo.findByTokenHash.mockResolvedValue({
        user: mockUser,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.refresh(rawToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── logout ─────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should revoke the refresh token', async () => {
      refreshRepo.revoke.mockResolvedValue(undefined);

      await service.logout('raw_token');

      expect(refreshRepo.revoke).toHaveBeenCalled();
    });
  });

  // ─── me ─────────────────────────────────────────────────────────────────────

  describe('me', () => {
    it('should return user by id', async () => {
      userRepo.findById.mockResolvedValue(mockUser);

      const result = await service.me(1);

      expect(userRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(service.me(99)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── updateProfile ──────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('should update fullName and phone', async () => {
      const existingUser = { ...mockUser };
      userRepo.findById.mockResolvedValue(existingUser);
      userRepo.save.mockResolvedValue({ ...existingUser, fullName: 'Updated', phone: '0901234567' });

      const result = await service.updateProfile(1, {
        fullName: 'Updated',
        phone: '0901234567',
      });

      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: 'Updated', phone: '0901234567' }),
      );
      expect(result.fullName).toBe('Updated');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(service.updateProfile(99, {})).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── changePassword ─────────────────────────────────────────────────────────

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      userRepo.findById.mockResolvedValue({ ...mockUser });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepo.save.mockResolvedValue(mockUser);

      await service.changePassword(1, {
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when current password is wrong', async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(1, { currentPassword: 'wrong', newPassword: 'newpass123' }),
      ).rejects.toThrow(BadRequestException);
      expect(userRepo.save).not.toHaveBeenCalled();
    });
  });
});
