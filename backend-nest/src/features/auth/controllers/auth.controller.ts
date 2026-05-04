import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateMeDto } from '../dto/update-me.dto';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../types/jwt-payload.type';
import { User } from '../entities/user.entity';

const REFRESH_COOKIE = 'refreshToken';

interface UserSummary {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(@Body() dto: RegisterDto): Promise<{ data: UserSummary; message: string }> {
    const user = await this.authService.register(dto);
    return { data: this.toSummary(user), message: 'Registration successful' };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login, returns access token + refresh cookie' })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; user: UserSummary }> {
    const { user, tokens } = await this.authService.login(dto, this.metaFromReq(req));
    this.setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
    return { accessToken: tokens.accessToken, user: this.toSummary(user) };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using cookie' })
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; user: UserSummary }> {
    const cookieToken = this.readRefreshCookie(req);
    if (!cookieToken) {
      throw new UnauthorizedException({ code: 'AUTH_003', message: 'Token invalid' });
    }
    const { user, tokens } = await this.authService.refresh(cookieToken, this.metaFromReq(req));
    this.setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiresAt);
    return { accessToken: tokens.accessToken, user: this.toSummary(user) };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout, revoke refresh token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const token = this.readRefreshCookie(req);
    await this.authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, this.cookieClearOptions());
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  async me(@CurrentUser() current: AuthenticatedUser): Promise<UserSummary> {
    const user = await this.authService.me(current.id);
    return this.toSummary(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({ summary: 'Update profile' })
  async updateMe(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: UpdateMeDto,
  ): Promise<UserSummary> {
    const user = await this.authService.updateMe(current.id, dto);
    return this.toSummary(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change password (revokes other sessions)' })
  async changePassword(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.authService.changePassword(current.id, dto);
  }

  private toSummary(user: User): UserSummary {
    return {
      id: Number(user.id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? null,
      role: user.role?.name ?? 'customer',
    };
  }

  private metaFromReq(req: Request) {
    return {
      ipAddress: req.ip ?? null,
      userAgent: (req.headers['user-agent'] as string | undefined) ?? null,
    };
  }

  private readRefreshCookie(req: Request): string | undefined {
    const signed = (req.signedCookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
    if (signed) return signed;
    return (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
  }

  private setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.config.get<string>('app.nodeEnv') === 'production',
      sameSite: 'lax',
      signed: true,
      expires: expiresAt,
      path: '/',
    });
  }

  private cookieClearOptions() {
    return {
      httpOnly: true,
      secure: this.config.get<string>('app.nodeEnv') === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
  }
}
