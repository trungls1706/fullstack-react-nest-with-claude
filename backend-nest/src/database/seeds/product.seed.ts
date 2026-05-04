import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Product } from '../../features/product/entities/product.entity';
import { Category } from '../../features/product/entities/category.entity';
import { seedCategory } from './category.seed';

const PRODUCT_TEMPLATES = [
  // Smartphones
  { name: 'iPhone 15 Pro Max', category: 'smartphones' },
  { name: 'Samsung Galaxy S24 Ultra', category: 'smartphones' },
  { name: 'Google Pixel 9 Pro', category: 'smartphones' },
  { name: 'Xiaomi 14 Ultra', category: 'smartphones' },
  { name: 'OnePlus 12', category: 'smartphones' },
  // Laptops
  { name: 'MacBook Pro 16 M3', category: 'laptops' },
  { name: 'Dell XPS 15', category: 'laptops' },
  { name: 'ThinkPad X1 Carbon', category: 'laptops' },
  { name: 'ASUS ROG Zephyrus G14', category: 'laptops' },
  // Headphones
  { name: 'Sony WH-1000XM5', category: 'headphones' },
  { name: 'Apple AirPods Pro 2', category: 'headphones' },
  { name: 'Bose QuietComfort 45', category: 'headphones' },
  // Men's Clothing
  { name: 'Classic Polo Shirt', category: 'mens-clothing' },
  { name: 'Slim Fit Chino Pants', category: 'mens-clothing' },
  { name: 'Casual Oxford Shirt', category: 'mens-clothing' },
  { name: 'Denim Jacket', category: 'mens-clothing' },
  // Women's Clothing
  { name: 'Floral Summer Dress', category: 'womens-clothing' },
  { name: 'High-Waist Jeans', category: 'womens-clothing' },
  { name: 'Linen Blazer', category: 'womens-clothing' },
  // Shoes
  { name: 'Nike Air Max 270', category: 'shoes' },
  { name: 'Adidas Ultraboost 23', category: 'shoes' },
  { name: 'Classic Leather Loafers', category: 'shoes' },
  // Books
  { name: 'Clean Code by Robert Martin', category: 'programming-books' },
  { name: 'The Pragmatic Programmer', category: 'programming-books' },
  { name: 'Design Patterns: GoF', category: 'programming-books' },
  { name: 'The Great Gatsby', category: 'fiction-books' },
  // Home & Kitchen
  { name: 'Air Fryer 5.5L', category: 'kitchen-tools' },
  { name: 'Coffee Maker Deluxe', category: 'kitchen-tools' },
  { name: 'Ergonomic Office Chair', category: 'furniture' },
  // Sports
  { name: 'Adjustable Dumbbell Set', category: 'gym-equipment' },
  { name: 'Yoga Mat Premium', category: 'gym-equipment' },
  { name: 'Hiking Backpack 40L', category: 'outdoor-gear' },
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function seedProduct(dataSource: DataSource) {
  await seedCategory(dataSource);

  const productRepo = dataSource.getRepository(Product);
  if ((await productRepo.count()) >= PRODUCT_TEMPLATES.length) {
    console.log('⏭ Products already seeded');
    return;
  }

  const categoryRepo = dataSource.getRepository(Category);
  const allCategories = await categoryRepo.find();
  const categoryMap = new Map(allCategories.map((c) => [c.slug, c]));

  const products = PRODUCT_TEMPLATES.map((t) => {
    const category = categoryMap.get(t.category);
    return productRepo.create({
      name: t.name,
      slug: toSlug(t.name),
      categoryId: category?.id,
      description: faker.commerce.productDescription(),
      thumbnailUrl: `https://picsum.photos/seed/${toSlug(t.name)}/400/400`,
      isActive: true,
    });
  });

  await productRepo.save(products);
  console.log(`✓ Seeded ${products.length} products`);
}
