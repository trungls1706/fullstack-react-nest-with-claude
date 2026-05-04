import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Cart } from '../../features/cart/entities/cart.entity';
import { CartItem } from '../../features/cart/entities/cart-item.entity';
import { User } from '../../features/auth/entities/user.entity';
import { ProductVariant } from '../../features/product/entities/product-variant.entity';
import { seedUser } from './user.seed';
import { seedProductVariant } from './product-variant.seed';

export async function seedCart(dataSource: DataSource) {
  await seedUser(dataSource);
  await seedProductVariant(dataSource);

  const cartRepo = dataSource.getRepository(Cart);
  if ((await cartRepo.count()) > 0) {
    console.log('⏭ Carts already seeded');
    return;
  }

  const userRepo = dataSource.getRepository(User);
  const variantRepo = dataSource.getRepository(ProductVariant);

  const users = await userRepo.find();
  const variants = await variantRepo.find();

  if (variants.length === 0) {
    console.log('⚠ No variants found, skipping cart seed');
    return;
  }

  const cartItemRepo = dataSource.getRepository(CartItem);
  let totalItems = 0;

  // ~60% of users have an active cart
  const usersWithCart = faker.helpers.arrayElements(users, Math.floor(users.length * 0.6));

  for (const user of usersWithCart) {
    const cart = await cartRepo.save(
      cartRepo.create({ userId: user.id }),
    );

    // 1–5 items per cart, pick variants with stock > 0
    const availableVariants = variants.filter((v) => v.stockQuantity > 0);
    const itemCount = faker.number.int({ min: 1, max: Math.min(5, availableVariants.length) });
    const selectedVariants = faker.helpers.arrayElements(availableVariants, itemCount);

    const items = selectedVariants.map((variant) =>
      cartItemRepo.create({
        cartId: cart.id,
        productVariantId: variant.id,
        quantity: faker.number.int({ min: 1, max: 3 }),
      }),
    );

    await cartItemRepo.save(items);
    totalItems += items.length;
  }

  // 3 guest carts
  for (let g = 0; g < 3; g++) {
    const sessionId = faker.string.uuid();
    const cart = await cartRepo.save(
      cartRepo.create({ sessionId }),
    );

    const availableVariants = variants.filter((v) => v.stockQuantity > 0);
    const itemCount = faker.number.int({ min: 1, max: Math.min(3, availableVariants.length) });
    const selectedVariants = faker.helpers.arrayElements(availableVariants, itemCount);

    const items = selectedVariants.map((variant) =>
      cartItemRepo.create({
        cartId: cart.id,
        productVariantId: variant.id,
        quantity: faker.number.int({ min: 1, max: 2 }),
      }),
    );

    await cartItemRepo.save(items);
    totalItems += items.length;
  }

  console.log(`✓ Seeded ${usersWithCart.length + 3} carts (${usersWithCart.length} user + 3 guest) with ${totalItems} items`);
}
