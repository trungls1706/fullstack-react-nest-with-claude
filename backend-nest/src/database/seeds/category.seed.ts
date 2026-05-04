import { DataSource } from 'typeorm';
import { Category } from '../../features/product/entities/category.entity';

const CATEGORIES = [
  // Parent categories
  { name: 'Electronics', slug: 'electronics', parent: null },
  { name: 'Clothing', slug: 'clothing', parent: null },
  { name: 'Books', slug: 'books', parent: null },
  { name: 'Home & Kitchen', slug: 'home-kitchen', parent: null },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', parent: null },
  // Children of Electronics
  { name: 'Smartphones', slug: 'smartphones', parent: 'electronics' },
  { name: 'Laptops', slug: 'laptops', parent: 'electronics' },
  { name: 'Headphones', slug: 'headphones', parent: 'electronics' },
  { name: 'Cameras', slug: 'cameras', parent: 'electronics' },
  // Children of Clothing
  { name: "Men's Clothing", slug: 'mens-clothing', parent: 'clothing' },
  { name: "Women's Clothing", slug: 'womens-clothing', parent: 'clothing' },
  { name: 'Shoes', slug: 'shoes', parent: 'clothing' },
  // Children of Books
  { name: 'Programming', slug: 'programming-books', parent: 'books' },
  { name: 'Fiction', slug: 'fiction-books', parent: 'books' },
  // Children of Home & Kitchen
  { name: 'Furniture', slug: 'furniture', parent: 'home-kitchen' },
  { name: 'Kitchen Tools', slug: 'kitchen-tools', parent: 'home-kitchen' },
  // Children of Sports & Outdoors
  { name: 'Gym Equipment', slug: 'gym-equipment', parent: 'sports-outdoors' },
  { name: 'Outdoor Gear', slug: 'outdoor-gear', parent: 'sports-outdoors' },
];

export async function seedCategory(dataSource: DataSource) {
  const repo = dataSource.getRepository(Category);

  if ((await repo.count()) >= CATEGORIES.length) {
    console.log('⏭ Categories already seeded');
    return;
  }

  // Save parents first
  const parents = CATEGORIES.filter((c) => c.parent === null);
  const savedParents = await repo.save(
    parents.map((c) => repo.create({ name: c.name, slug: c.slug })),
  );
  const parentMap = new Map(savedParents.map((p) => [p.slug, p]));

  // Save children
  const children = CATEGORIES.filter((c) => c.parent !== null);
  await repo.save(
    children.map((c) => {
      const parent = parentMap.get(c.parent!);
      return repo.create({ name: c.name, slug: c.slug, parentId: parent?.id });
    }),
  );

  console.log(`✓ Seeded ${CATEGORIES.length} categories (${parents.length} parents, ${children.length} children)`);
}
