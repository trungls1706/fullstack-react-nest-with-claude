import { AppDataSource } from './data-source';
import {
  seedRole,
  seedUser,
  seedCategory,
  seedProduct,
  seedProductVariant,
  seedProductImage,
  seedAddress,
  seedOrder,
  seedReview,
  seedCart,
} from './seeds';

const seeders: Record<string, (ds: typeof AppDataSource, count?: number) => Promise<void>> = {
  role: seedRole,
  user: seedUser,
  category: seedCategory,
  product: seedProduct,
  variant: seedProductVariant,
  image: seedProductImage,
  address: seedAddress,
  order: seedOrder,
  review: seedReview,
  cart: seedCart,
};

async function seedAll(dataSource: typeof AppDataSource) {
  console.log('\n🌱 Seeding all features...\n');
  await seedRole(dataSource);
  await seedUser(dataSource);
  await seedCategory(dataSource);
  await seedProduct(dataSource);
  await seedProductVariant(dataSource);
  await seedProductImage(dataSource);
  await seedAddress(dataSource);
  await seedOrder(dataSource);
  await seedReview(dataSource);
  await seedCart(dataSource);
  console.log('\n✅ All features seeded successfully!\n');
}

async function main() {
  const entity = process.argv[2];
  const count = process.argv[3] ? parseInt(process.argv[3], 10) : undefined;

  if (!entity) {
    console.error('Usage: npm run seed -- <entity|all> [count]');
    console.error('Available:', ['all', ...Object.keys(seeders)].join(', '));
    process.exit(1);
  }

  await AppDataSource.initialize();
  try {
    if (entity === 'all') {
      await seedAll(AppDataSource);
    } else {
      const seeder = seeders[entity];
      if (!seeder) {
        console.error(`Unknown entity: "${entity}". Available: ${['all', ...Object.keys(seeders)].join(', ')}`);
        process.exit(1);
      }
      await seeder(AppDataSource, count);
    }
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
