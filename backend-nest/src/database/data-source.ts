import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { Role } from '../features/auth/entities/role.entity';
import { User } from '../features/auth/entities/user.entity';

loadEnv();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'hoc_claude_ecommerce',
  entities: [Role, User],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
