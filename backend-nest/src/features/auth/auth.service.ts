import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { JwtPayload } from './types/jwt-payload.type';

export interface LoginMeta {
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    this.logger.log(`Registering user: ${dto.email}`);

    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`Email "${dto.email}" already exists`);
    }

    const customerRole = await this.roleRepository.findByName('customer');
    if (!customerRole) {
      throw new BadRequestException('Default role not configured');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.userRepository.save({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
      roleId: customerRole.id,
      isActive: true,
    });
  }

  async login(dto: LoginDto, meta: LoginMeta): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Load role relation if not already loaded
    const userWithRole = await this.userRepository.findById(user.id);
    if (!userWithRole) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.signAccessToken(userWithRole);
    const { rawToken, tokenHash } = this.generateRefreshToken();
    const expiresAt = this.getRefreshTokenExpiry();

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
      deviceName: null,
      expiresAt,
      isRevoked: false,
    });

    this.logger.log(`User #${user.id} logged in`);

    return { accessToken, refreshToken: rawToken, user: userWithRole };
  }

  async refresh(rawRefreshToken: string): Promise<{ accessToken: string }> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const tokenRecord = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (!tokenRecord.user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const accessToken = this.signAccessToken(tokenRecord.user);
    return { accessToken };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.refreshTokenRepository.revoke(tokenHash);
    this.logger.log('User logged out');
  }

  async me(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.phone !== undefined) user.phone = dto.phone ?? null;

    return this.userRepository.save(user);
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);
    this.logger.log(`User #${userId} changed password`);
  }

  private signAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name ?? '',
    };
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(): { rawToken: string; tokenHash: string } {
    const rawToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    return { rawToken, tokenHash };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private getRefreshTokenExpiry(): Date {
    const expiresAt = new Date();
    const duration = this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const days = parseInt(duration.replace('d', ''), 10) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }
}
