import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { RoleService } from './services/role.service';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { RoleController } from './controllers/role.controller';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret') ?? 'change-me',
        signOptions: {
          expiresIn: (config.get<string>('jwt.expiresIn') ?? '15m') as unknown as number,
        },
      }),
    }),
  ],
  controllers: [RoleController, UserController, AuthController],
  providers: [
    RoleRepository,
    RoleService,
    UserRepository,
    UserService,
    RefreshTokenRepository,
    AuthService,
    JwtStrategy,
  ],
  exports: [RoleService, UserService, AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
