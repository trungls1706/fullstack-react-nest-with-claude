import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const role: Role = { id: 1, name: 'customer' };
  const user = {
    id: 10,
    email: 'a@b.com',
    fullName: 'Tester',
    phone: null,
    isActive: true,
    role,
  } as User;

  const tokens = {
    accessToken: 'access.jwt',
    refreshToken: 'refresh-token',
    refreshExpiresAt: new Date(Date.now() + 60_000),
  };

  const mockRes = (): jest.Mocked<Response> => {
    const res: Partial<Response> = {
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    return res as jest.Mocked<Response>;
  };

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<AuthService>> = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      me: jest.fn(),
      updateMe: jest.fn(),
      changePassword: jest.fn(),
    };

    const config = {
      get: jest.fn((key: string) => (key === 'app.nodeEnv' ? 'test' : undefined)),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: serviceMock },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService);
  });

  describe('POST /auth/register', () => {
    it('returns user summary', async () => {
      service.register.mockResolvedValue(user);
      const res = await controller.register({
        email: 'a@b.com',
        password: 'password123',
        fullName: 'Tester',
      });
      expect(res.data).toEqual({
        id: 10,
        email: 'a@b.com',
        fullName: 'Tester',
        phone: null,
        role: 'customer',
      });
      expect(res.message).toBe('Registration successful');
    });
  });

  describe('POST /auth/login', () => {
    it('returns access token and sets refresh cookie', async () => {
      service.login.mockResolvedValue({ user, tokens });
      const res = mockRes();
      const req = { ip: '1.2.3.4', headers: { 'user-agent': 'jest' } } as unknown as Request;

      const result = await controller.login(
        { email: 'a@b.com', password: 'password123' },
        req,
        res,
      );

      expect(result.accessToken).toBe('access.jwt');
      expect(result.user.email).toBe('a@b.com');
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          signed: true,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('reads cookie, returns new access token', async () => {
      service.refresh.mockResolvedValue({ user, tokens });
      const res = mockRes();
      const req = {
        signedCookies: { refreshToken: 'old-token' },
        cookies: {},
        ip: '1.2.3.4',
        headers: {},
      } as unknown as Request;

      const result = await controller.refresh(req, res);

      expect(service.refresh).toHaveBeenCalledWith('old-token', expect.any(Object));
      expect(result.accessToken).toBe('access.jwt');
      expect(res.cookie).toHaveBeenCalled();
    });

    it('throws when refresh cookie missing', async () => {
      const res = mockRes();
      const req = { signedCookies: {}, cookies: {}, headers: {} } as unknown as Request;
      await expect(controller.refresh(req, res)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(service.refresh).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    it('revokes refresh token and clears cookie', async () => {
      const res = mockRes();
      const req = {
        signedCookies: { refreshToken: 'tok' },
        cookies: {},
        headers: {},
      } as unknown as Request;

      await controller.logout(req, res);

      expect(service.logout).toHaveBeenCalledWith('tok');
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
    });
  });

  describe('GET /auth/me', () => {
    it('returns current user summary', async () => {
      service.me.mockResolvedValue(user);
      const result = await controller.me({ id: 10, email: 'a@b.com', role: 'customer' });
      expect(result.id).toBe(10);
      expect(result.role).toBe('customer');
    });
  });

  describe('PATCH /auth/me', () => {
    it('delegates to service.updateMe', async () => {
      service.updateMe.mockResolvedValue({ ...user, fullName: 'Updated' } as User);
      const result = await controller.updateMe(
        { id: 10, email: 'a@b.com', role: 'customer' },
        { fullName: 'Updated' },
      );
      expect(service.updateMe).toHaveBeenCalledWith(10, { fullName: 'Updated' });
      expect(result.fullName).toBe('Updated');
    });
  });

  describe('PATCH /auth/change-password', () => {
    it('delegates to service.changePassword', async () => {
      await controller.changePassword(
        { id: 10, email: 'a@b.com', role: 'customer' },
        { currentPassword: 'old', newPassword: 'new-password' },
      );
      expect(service.changePassword).toHaveBeenCalledWith(10, {
        currentPassword: 'old',
        newPassword: 'new-password',
      });
    });
  });
});
