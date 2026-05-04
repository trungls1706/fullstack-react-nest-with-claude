import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService, parseDurationMs } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<UserRepository>;
  let roleRepo: jest.Mocked<RoleRepository>;
  let refreshRepo: jest.Mocked<RefreshTokenRepository>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  const role: Role = { id: 1, name: 'customer' };
  const buildUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 10,
      roleId: 1,
      role,
      email: 'a@b.com',
      passwordHash: 'hashed',
      fullName: 'Tester',
      phone: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as User;

  beforeEach(async () => {
    userRepo = {
      list: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      emailExists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    roleRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<RoleRepository>;

    refreshRepo = {
      create: jest.fn(),
      findActiveByHash: jest.fn(),
      revokeById: jest.fn(),
      revokeByHash: jest.fn(),
      revokeAllForUser: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenRepository>;

    jwtService = { signAsync: jest.fn().mockResolvedValue('access.jwt.token') };

    const config = {
      get: jest.fn((key: string) => {
        if (key === 'jwt.refreshExpiresIn') return '7d';
        if (key === 'jwt.secret') return 'test-secret';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepo },
        { provide: RoleRepository, useValue: roleRepo },
        { provide: RefreshTokenRepository, useValue: refreshRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('parseDurationMs helper', () => {
    it('parses days/hours/minutes/seconds', () => {
      expect(parseDurationMs('7d')).toBe(7 * 86_400_000);
      expect(parseDurationMs('15m')).toBe(15 * 60_000);
      expect(parseDurationMs('2h')).toBe(2 * 3_600_000);
      expect(parseDurationMs('30s')).toBe(30 * 1000);
    });

    it('falls back to 7 days on invalid input', () => {
      expect(parseDurationMs('invalid')).toBe(7 * 86_400_000);
    });
  });

  describe('register', () => {
    it('creates user with default customer role', async () => {
      userRepo.emailExists.mockResolvedValue(false);
      roleRepo.findByName.mockResolvedValue(role);
      userRepo.create.mockImplementation(async (data) => buildUser(data as Partial<User>));

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
      });

      expect(userRepo.emailExists).toHaveBeenCalledWith('new@example.com');
      expect(roleRepo.findByName).toHaveBeenCalledWith('customer');
      expect(roleRepo.create).not.toHaveBeenCalled();
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          fullName: 'New User',
          roleId: role.id,
          isActive: true,
        }),
      );
      // password should be hashed (not plain)
      const createArg = userRepo.create.mock.calls[0][0] as Partial<User>;
      expect(createArg.passwordHash).toBeDefined();
      expect(createArg.passwordHash).not.toBe('password123');
      expect(result.role).toEqual(role);
    });

    it('creates default role when none exists', async () => {
      userRepo.emailExists.mockResolvedValue(false);
      roleRepo.findByName.mockResolvedValue(null);
      roleRepo.create.mockResolvedValue(role);
      userRepo.create.mockImplementation(async (data) => buildUser(data as Partial<User>));

      await service.register({ email: 'x@y.com', password: 'password123', fullName: 'X Y' });

      expect(roleRepo.create).toHaveBeenCalledWith('customer');
    });

    it('throws ConflictException when email already exists', async () => {
      userRepo.emailExists.mockResolvedValue(true);
      await expect(
        service.register({ email: 'a@b.com', password: 'password123', fullName: 'A B' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(userRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns user + tokens on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('correct-pw', 4);
      const user = buildUser({ passwordHash });
      userRepo.findByEmail.mockResolvedValue(user);
      refreshRepo.create.mockImplementation(async (data) => data as RefreshToken);

      const result = await service.login(
        { email: 'a@b.com', password: 'correct-pw' },
        { ipAddress: '1.2.3.4', userAgent: 'jest' },
      );

      expect(result.user).toBe(user);
      expect(result.tokens.accessToken).toBe('access.jwt.token');
      expect(result.tokens.refreshToken).toMatch(/^[a-f0-9]+$/);
      expect(result.tokens.refreshToken.length).toBeGreaterThanOrEqual(64);
      expect(refreshRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          ipAddress: '1.2.3.4',
          userAgent: 'jest',
          isRevoked: false,
        }),
      );
      // tokenHash should not equal raw token
      const createArg = refreshRepo.create.mock.calls[0][0];
      expect(createArg.tokenHash).not.toBe(result.tokens.refreshToken);
    });

    it('throws UnauthorizedException when user not found', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'no@one.com', password: 'pw' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when password incorrect', async () => {
      const passwordHash = await bcrypt.hash('correct-pw', 4);
      userRepo.findByEmail.mockResolvedValue(buildUser({ passwordHash }));
      await expect(
        service.login({ email: 'a@b.com', password: 'wrong-pw' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects inactive user', async () => {
      userRepo.findByEmail.mockResolvedValue(buildUser({ isActive: false }));
      await expect(
        service.login({ email: 'a@b.com', password: 'whatever' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('rotates refresh token and issues new access token', async () => {
      const user = buildUser();
      const record = {
        id: 5,
        userId: user.id,
        user,
        expiresAt: new Date(Date.now() + 60_000),
        isRevoked: false,
      } as RefreshToken;
      refreshRepo.findActiveByHash.mockResolvedValue(record);
      refreshRepo.create.mockImplementation(async (data) => data as RefreshToken);

      const result = await service.refresh('plain-refresh-token');

      expect(refreshRepo.revokeById).toHaveBeenCalledWith(5);
      expect(refreshRepo.create).toHaveBeenCalled();
      expect(result.tokens.accessToken).toBe('access.jwt.token');
      expect(result.tokens.refreshToken).not.toBe('plain-refresh-token');
    });

    it('throws when token missing', async () => {
      await expect(service.refresh('')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when token not found', async () => {
      refreshRepo.findActiveByHash.mockResolvedValue(null);
      await expect(service.refresh('xxx')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when token expired', async () => {
      refreshRepo.findActiveByHash.mockResolvedValue({
        id: 5,
        userId: 10,
        user: buildUser(),
        expiresAt: new Date(Date.now() - 1000),
        isRevoked: false,
      } as RefreshToken);
      await expect(service.refresh('xxx')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when user inactive', async () => {
      refreshRepo.findActiveByHash.mockResolvedValue({
        id: 5,
        userId: 10,
        user: buildUser({ isActive: false }),
        expiresAt: new Date(Date.now() + 60_000),
        isRevoked: false,
      } as RefreshToken);
      await expect(service.refresh('xxx')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('revokes the token by hash', async () => {
      await service.logout('refresh-token');
      expect(refreshRepo.revokeByHash).toHaveBeenCalledTimes(1);
      // hash, not plain
      expect(refreshRepo.revokeByHash).not.toHaveBeenCalledWith('refresh-token');
    });

    it('no-ops when token missing', async () => {
      await service.logout(undefined);
      expect(refreshRepo.revokeByHash).not.toHaveBeenCalled();
    });
  });

  describe('me / updateMe', () => {
    it('returns user when found', async () => {
      const user = buildUser();
      userRepo.findById.mockResolvedValue(user);
      await expect(service.me(10)).resolves.toBe(user);
    });

    it('throws NotFoundException when missing', async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.me(99)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates only provided fields', async () => {
      const user = buildUser();
      userRepo.findById.mockResolvedValue(user);
      const updated = buildUser({ fullName: 'New Name' });
      userRepo.update.mockResolvedValue(updated);

      const result = await service.updateMe(10, { fullName: 'New Name' });

      expect(userRepo.update).toHaveBeenCalledWith(10, { fullName: 'New Name' });
      expect(result).toBe(updated);
    });

    it('skips db update when no fields provided', async () => {
      userRepo.findById.mockResolvedValue(buildUser());
      await service.updateMe(10, {});
      expect(userRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('rotates password hash and revokes sessions on success', async () => {
      const passwordHash = await bcrypt.hash('current-pw', 4);
      const user = buildUser({ passwordHash });
      userRepo.findById.mockResolvedValue(user);
      userRepo.findByEmail.mockResolvedValue(user);

      await service.changePassword(10, {
        currentPassword: 'current-pw',
        newPassword: 'brand-new-pw',
      });

      expect(userRepo.update).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ passwordHash: expect.any(String) }),
      );
      const updateArg = userRepo.update.mock.calls[0][1] as Partial<User>;
      expect(updateArg.passwordHash).not.toBe(passwordHash);
      expect(refreshRepo.revokeAllForUser).toHaveBeenCalledWith(10);
    });

    it('throws BadRequestException when current password wrong', async () => {
      const passwordHash = await bcrypt.hash('current-pw', 4);
      const user = buildUser({ passwordHash });
      userRepo.findById.mockResolvedValue(user);
      userRepo.findByEmail.mockResolvedValue(user);

      await expect(
        service.changePassword(10, { currentPassword: 'wrong', newPassword: 'pw12345678' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(userRepo.update).not.toHaveBeenCalled();
      expect(refreshRepo.revokeAllForUser).not.toHaveBeenCalled();
    });
  });
});
