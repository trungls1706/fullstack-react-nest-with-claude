import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

const mockAuthService = () => ({
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
});

const mockUser = {
  id: 1,
  email: 'user@test.com',
  fullName: 'Test User',
  phone: null,
  role: { id: 1, name: 'customer' },
  isActive: true,
  createdAt: new Date(),
};

const mockRequest = (cookies: Record<string, string> = {}) =>
  ({
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
    cookies,
  }) as never;

const mockResponse = () => {
  const res = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  return res as unknown as import('express').Response;
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: ReturnType<typeof mockAuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useFactory: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  // ─── register ───────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should register and return user info', async () => {
      service.register.mockResolvedValue(mockUser);

      const result = await controller.register({
        email: 'user@test.com',
        password: 'password123',
        fullName: 'Test User',
      });

      expect(service.register).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: 'customer',
      });
    });
  });

  // ─── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should login and set refresh token cookie', async () => {
      service.login.mockResolvedValue({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: mockUser,
      });
      const res = mockResponse();

      const result = await controller.login(
        { email: 'user@test.com', password: 'password123' },
        mockRequest(),
        res,
      );

      expect(service.login).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh_token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result.accessToken).toBe('access_token');
    });
  });

  // ─── refresh ────────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('should return new access token', async () => {
      service.refresh.mockResolvedValue({ accessToken: 'new_token' });
      const req = mockRequest({ refreshToken: 'raw_token' });

      const result = await controller.refresh(req);

      expect(service.refresh).toHaveBeenCalledWith('raw_token');
      expect(result.accessToken).toBe('new_token');
    });

    it('should throw UnauthorizedException when no refresh cookie', async () => {
      const req = mockRequest({});

      await expect(controller.refresh(req)).rejects.toThrow();
    });
  });

  // ─── logout ─────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should logout and clear cookie', async () => {
      service.logout.mockResolvedValue(undefined);
      const res = mockResponse();

      await controller.logout(mockRequest({ refreshToken: 'raw_token' }), res);

      expect(service.logout).toHaveBeenCalledWith('raw_token');
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    });

    it('should clear cookie even without refresh token', async () => {
      const res = mockResponse();

      await controller.logout(mockRequest({}), res);

      expect(service.logout).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    });
  });

  // ─── me ─────────────────────────────────────────────────────────────────────

  describe('me', () => {
    it('should return current user info', () => {
      const result = controller.me(mockUser as never);

      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
        }),
      );
    });
  });

  // ─── updateProfile ──────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('should update and return profile', async () => {
      service.updateProfile.mockResolvedValue({
        ...mockUser,
        fullName: 'Updated Name',
      });

      const result = await controller.updateProfile(mockUser as never, {
        fullName: 'Updated Name',
      });

      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, { fullName: 'Updated Name' });
      expect(result.fullName).toBe('Updated Name');
    });
  });
});
