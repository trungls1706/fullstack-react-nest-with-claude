import { DataSource } from 'typeorm';
import { Product } from '../../features/product/entities/product.entity';
import { ProductImage } from '../../features/product/entities/product-image.entity';
import { seedProduct } from './product.seed';

export async function seedProductImage(dataSource: DataSource) {
  await seedProduct(dataSource);

  const imageRepo = dataSource.getRepository(ProductImage);
  if ((await imageRepo.count()) > 0) {
    console.log('⏭ Product images already seeded');
    return;
  }

  const productRepo = dataSource.getRepository(Product);
  const products = await productRepo.find();

  const images: Partial<ProductImage>[] = [];

  for (const product of products) {
    // 3–5 images per product
    const count = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < count; i++) {
      images.push({
        productId: product.id,
        imageUrl: `https://picsum.photos/seed/${product.slug}-${i + 1}/800/800`,
        sortOrder: i,
      });
    }
  }

  await imageRepo.save(images);
  console.log(`✓ Seeded ${images.length} product images across ${products.length} products`);
}
