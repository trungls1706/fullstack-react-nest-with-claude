import { DataSource } from 'typeorm';
import { Role } from '../../features/auth/entities/role.entity';

const ROLE_NAMES = ['customer', 'admin'] as const;

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Role);

  const existing = await repo.find({ select: ['name'] });
  const existingNames = new Set(existing.map((r) => r.name));

  const toInsert = ROLE_NAMES.filter((name) => !existingNames.has(name)).map(
    (name) => repo.create({ name }),
  );

  if (toInsert.length === 0) {
    console.log('⏭  Roles already seeded — skipping');
    return;
  }

  await repo.save(toInsert);
  console.log(`✓ Seeded ${toInsert.length} role(s): ${toInsert.map((r) => r.name).join(', ')}`);
}
