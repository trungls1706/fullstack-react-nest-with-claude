import { DataSource } from 'typeorm';
import { Role } from '../../features/auth/entities/role.entity';

export async function seedRole(dataSource: DataSource) {
  const repo = dataSource.getRepository(Role);

  if ((await repo.count()) >= 2) {
    console.log('⏭ Roles already seeded');
    return;
  }

  await repo.save([{ name: 'admin' }, { name: 'customer' }]);
  console.log('✓ Seeded 2 roles: admin, customer');
}
