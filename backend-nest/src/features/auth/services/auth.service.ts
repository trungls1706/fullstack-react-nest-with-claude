import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateMeDto } from '../dto/update-me.dto';
import { JwtPayload } from '../types/jwt-payload.type';
import { comparePassword, hashPassword } from '../../../shared/utils/hash.util';

const DEFAULT_ROLE_NAME = 'customer';
const REFRESH_BYTES = 48;

export interface SessionMeta {
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceName?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly roleRepo: RoleRepository,
    private readonly refreshRepo: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    if (await this.userRepo.emailExists(dto.email)) {
      throw new ConflictException({
        code: 'AUTH_005',
        message: 'Email already exists',
      });
    }

    const role =
      (await this.roleRepo.findByName(DEFAULT_ROLE_NAME)) ??
      (await this.roleRepo.create(DEFAULT_ROLE_NAME));

    const passwordHash = await hashPassword(dto.password);
    this.logger.log(`Registering user ${dto.email}`);

    const user = await this.userRepo.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
      roleId: role.id,
      isActive: true,
    });
    user.role = role;
    return user;
  }

  async login(dto: LoginDto, meta: SessionMeta = {}): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        code: 'AUTH_001',
        message: 'Invalid credentials',
      });
    }

    const ok = await comparePassword(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException({
        code: 'AUTH_001',
        message: 'Invalid credentials',
      });
    }

    const tokens = await this.issueTokens(user, meta);
    this.logger.log(`User #${user.id} logged in`);
    return { user, tokens };
  }

  async refresh(
    refreshToken: string,
    meta: SessionMeta = {},
  ): Promise<{ user: User; tokens: AuthTokens }> {
    if (!refreshToken) {
      throw new UnauthorizedException({ code: 'AUTH_003', message: 'Token invalid' });
    }
    const tokenHash = this.hashRefreshToken(refreshToken);
    const record = await this.refreshRepo.findActiveByHash(tokenHash);
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException({ code: 'AUTH_002', message: 'Token expired' });
    }
    const user = record.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedException({ code: 'AUTH_003', message: 'Token invalid' });
    }

    // Rotate: revoke current, issue new pair
    await this.refreshRepo.revokeById(record.id);
    const tokens = await this.issueTokens(user, meta);
    return { user, tokens };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.refreshRepo.revokeByHash(tokenHash);
  }

  async me(userId: number): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException({ code: 'USER_001', message: 'User not found' });
    }
    return user;
  }

  async updateMe(userId: number, dto: UpdateMeDto): Promise<User> {
    await this.me(userId);
    const patch: Partial<User> = {};
    if (dto.fullName !== undefined) patch.fullName = dto.fullName;
    if (dto.phone !== undefined) patch.phone = dto.phone;
    if (Object.keys(patch).length === 0) return this.me(userId);
    const updated = await this.userRepo.update(userId, patch);
    return updated as User;
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmail(
      (await this.me(userId)).email,
    );
    if (!user) {
      throw new NotFoundException({ code: 'USER_001', message: 'User not found' });
    }
    const ok = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!ok) {
      throw new BadRequestException({
        code: 'AUTH_001',
        message: 'Current password is incorrect',
      });
    }
    const passwordHash = await hashPassword(dto.newPassword);
    await this.userRepo.update(userId, { passwordHash });
    await this.refreshRepo.revokeAllForUser(userId);
  }

  private async issueTokens(user: User, meta: SessionMeta): Promise<AuthTokens> {
    const roleName = user.role?.name ?? DEFAULT_ROLE_NAME;
    const payload: JwtPayload = { sub: user.id, email: user.email, role: roleName };
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = randomBytes(REFRESH_BYTES).toString('hex');
    const tokenHash = this.hashRefreshToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + this.refreshTtlMs());

    await this.refreshRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt: refreshExpiresAt,
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
      deviceName: meta.deviceName ?? null,
      isRevoked: false,
    });

    return { accessToken, refreshToken, refreshExpiresAt };
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private refreshTtlMs(): number {
    const raw = this.config.get<string>('jwt.refreshExpiresIn') ?? '7d';
    return parseDurationMs(raw);
  }
}

export function parseDurationMs(input: string): number {
  const match = /^(\d+)\s*([smhd])?$/i.exec(input.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = (match[2] ?? 's').toLowerCase();
  const mult: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * (mult[unit] ?? 1000);
}
