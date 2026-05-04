import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { User } from '../../features/auth/entities/user.entity';
import { Role } from '../../features/auth/entities/role.entity';
import { seedRole } from './role.seed';

export async function seedUser(dataSource: DataSource, count = 20) {
  await seedRole(dataSource);

  const userRepo = dataSource.getRepository(User);
  if ((await userRepo.count()) >= count) {
    console.log('⏭ Users already seeded');
    return;
  }

  const roleRepo = dataSource.getRepository(Role);
  const adminRole = await roleRepo.findOneByOrFail({ name: 'admin' });
  const customerRole = await roleRepo.findOneByOrFail({ name: 'customer' });

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const customerPassword = await bcrypt.hash('Customer@123', 10);
  const defaultPassword = await bcrypt.hash('Password@123', 10);

  const fixedUsers = [
    {
      roleId: adminRole.id,
      email: 'admin@example.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      phone: '0901111111',
      isActive: true,
    },
    {
      roleId: customerRole.id,
      email: 'customer@example.com',
      passwordHash: customerPassword,
      fullName: 'Customer User',
      phone: '0902222222',
      isActive: true,
    },
  ];

  const randomUsers = Array.from({ length: count - 2 }, () => ({
    roleId: customerRole.id,
    email: faker.internet.email().toLowerCase(),
    passwordHash: defaultPassword,
    fullName: faker.person.fullName(),
    phone: `09${faker.string.numeric(8)}`,
    isActive: true,
  }));

  await userRepo.save([...fixedUsers, ...randomUsers]);
  console.log(`✓ Seeded ${count} users (admin@example.com / customer@example.com + ${count - 2} random)`);
}
