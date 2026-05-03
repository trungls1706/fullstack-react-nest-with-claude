import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { RoleService } from './services/role.service';
import { UserService } from './services/user.service';
import { RoleController } from './controllers/role.controller';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User])],
  controllers: [RoleController, UserController],
  providers: [RoleRepository, RoleService, UserRepository, UserService],
  exports: [RoleService, UserService],
})
export class AuthModule {}
