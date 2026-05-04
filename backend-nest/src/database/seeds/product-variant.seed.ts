import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Product } from '../../features/product/entities/product.entity';
import { ProductVariant } from '../../features/product/entities/product-variant.entity';
import { Category } from '../../features/product/entities/category.entity';
import { seedProduct } from './product.seed';

// Variant config by category slug
const VARIANT_CONFIG: Record<string, { colors: string[]; sizes: string[] }> = {
  smartphones: { colors: ['Black', 'White', 'Blue', 'Gold'], sizes: ['128GB', '256GB', '512GB'] },
  laptops: { colors: ['Space Gray', 'Silver'], sizes: ['8GB/256GB', '16GB/512GB', '32GB/1TB'] },
  headphones: { colors: ['Black', 'White', 'Blue'], sizes: [] },
  cameras: { colors: ['Black', 'Silver'], sizes: [] },
  'mens-clothing': { colors: ['White', 'Black', 'Navy', 'Gray', 'Beige'], sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  'womens-clothing': { colors: ['White', 'Black', 'Pink', 'Blue', 'Red'], sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  shoes: { colors: ['Black', 'White', 'Gray', 'Navy'], sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'] },
  'programming-books': { colors: [], sizes: ['Paperback', 'Hardcover'] },
  'fiction-books': { colors: [], sizes: ['Paperback', 'Hardcover'] },
  'kitchen-tools': { colors: ['Black', 'White', 'Silver'], sizes: [] },
  furniture: { colors: ['Black', 'Brown', 'White'], sizes: [] },
  'gym-equipment': { colors: ['Black', 'Gray', 'Blue'], sizes: ['5kg', '10kg', '15kg', '20kg'] },
  'outdoor-gear': { colors: ['Green', 'Gray', 'Black', 'Orange'], sizes: ['S', 'M', 'L'] },
};

const DEFAULT_CONFIG = { colors: ['Default'], sizes: ['One Size'] };

function getBasePrice(categorySlug: string): number {
  const prices: Record<string, [number, number]> = {
    smartphones: [8000000, 35000000],
    laptops: [15000000, 60000000],
    headphones: [500000, 8000000],
    cameras: [5000000, 30000000],
    'mens-clothing': [150000, 800000],
    'womens-clothing': [150000, 1000000],
    shoes: [300000, 3000000],
    'programming-books': [80000, 300000],
    'fiction-books': [60000, 200000],
    'kitchen-tools': [200000, 2000000],
    furniture: [500000, 5000000],
    'gym-equipment': [200000, 3000000],
    'outdoor-gear': [200000, 2000000],
  };
  const [min, max] = prices[categorySlug] ?? [100000, 500000];
  return faker.number.int({ min, max });
}

export async function seedProductVariant(dataSource: DataSource) {
  await seedProduct(dataSource);

  const variantRepo = dataSource.getRepository(ProductVariant);
  if ((await variantRepo.count()) > 0) {
    console.log('⏭ Product variants already seeded');
    return;
  }

  const productRepo = dataSource.getRepository(Product);
  const categoryRepo = dataSource.getRepository(Category);
  const products = await productRepo.find();

  const variants: Partial<ProductVariant>[] = [];
  const usedSkus = new Set<string>();

  for (const product of products) {
    const category = await categoryRepo.findOne({ where: { id: product.categoryId } });
    const config = (category && VARIANT_CONFIG[category.slug]) ?? DEFAULT_CONFIG;

    const colors = config.colors.length > 0 ? config.colors : [null];
    const sizes = config.sizes.length > 0 ? config.sizes : [null];

    // Generate max 3 colors × 3 sizes = 9 variants per product to keep data manageable
    const selectedColors = colors.slice(0, 3);
    const selectedSizes = sizes.slice(0, 3);

    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        const basePrice = getBasePrice(category?.slug ?? '');
        const skuParts = [
          product.slug.toUpperCase().slice(0, 8),
          color ? color.toUpperCase().slice(0, 3) : 'DEF',
          size ? size.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) : 'ONE',
          faker.string.alphanumeric(3).toUpperCase(),
        ];
        let sku = skuParts.join('-');
        // Ensure uniqueness
        while (usedSkus.has(sku)) {
          sku = skuParts.slice(0, 3).join('-') + '-' + faker.string.alphanumeric(4).toUpperCase();
        }
        usedSkus.add(sku);

        const hasSale = faker.datatype.boolean({ probability: 0.3 });
        variants.push({
          productId: product.id,
          sku,
          color: color ?? undefined,
          size: size ?? undefined,
          price: basePrice,
          salePrice: hasSale ? Math.round(basePrice * faker.number.float({ min: 0.7, max: 0.95 })) : undefined,
          stockQuantity: faker.number.int({ min: 0, max: 100 }),
        });
      }
    }
  }

  await variantRepo.save(variants);
  console.log(`✓ Seeded ${variants.length} product variants across ${products.length} products`);
}
