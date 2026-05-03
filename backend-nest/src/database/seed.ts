import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppDataSource } from './data-source';
import { seedRoles } from './seeds';

type Seeder = (dataSource: DataSource) => Promise<void>;

const seeders: Record<string, Seeder> = {
  roles: seedRoles,
};

async function main() {
  const entity = process.argv[2];

  if (!entity) {
    console.error('Usage: npm run seed -- <entity>');
    console.error(`Available entities: ${Object.keys(seeders).join(', ')}`);
    process.exit(1);
  }

  const seeder = seeders[entity];
  if (!seeder) {
    console.error(`Unknown entity "${entity}". Available: ${Object.keys(seeders).join(', ')}`);
    process.exit(1);
  }

  await AppDataSource.initialize();
  console.log(`→ Seeding ${entity}...`);
  try {
    await seeder(AppDataSource);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('✗ Seed failed:', err);
  process.exit(1);
});
