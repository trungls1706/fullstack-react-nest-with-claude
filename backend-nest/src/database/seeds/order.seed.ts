import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Order } from '../../features/order/entities/order.entity';
import { OrderItem } from '../../features/order/entities/order-item.entity';
import { User } from '../../features/auth/entities/user.entity';
import { ProductVariant } from '../../features/product/entities/product-variant.entity';
import { Product } from '../../features/product/entities/product.entity';
import { Address } from '../../features/user-profile/entities/address.entity';
import { OrderStatus, PaymentStatus } from '../../features/order/types/order-status.type';
import { seedAddress } from './address.seed';
import { seedProductVariant } from './product-variant.seed';

const ORDER_STATUSES = Object.values(OrderStatus);
const PAYMENT_METHODS = ['cod', 'bank_transfer', 'momo', 'vnpay'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedOrder(dataSource: DataSource, count = 50) {
  await seedAddress(dataSource);
  await seedProductVariant(dataSource);

  const orderRepo = dataSource.getRepository(Order);
  if ((await orderRepo.count()) >= count) {
    console.log('⏭ Orders already seeded');
    return;
  }

  const userRepo = dataSource.getRepository(User);
  const variantRepo = dataSource.getRepository(ProductVariant);
  const productRepo = dataSource.getRepository(Product);
  const addressRepo = dataSource.getRepository(Address);
  const orderItemRepo = dataSource.getRepository(OrderItem);

  const users = await userRepo.find();
  const variants = await variantRepo.find();
  const products = await productRepo.find();
  const productMap = new Map(products.map((p) => [p.id, p]));

  if (variants.length === 0) {
    console.log('⚠ No variants found, skipping order seed');
    return;
  }

  let seededCount = 0;

  for (let i = 0; i < count; i++) {
    const user = pickRandom(users);
    const userAddresses = await addressRepo.findBy({ userId: user.id });
    const address = userAddresses.length > 0 ? pickRandom(userAddresses) : null;

    const status: OrderStatus = pickRandom(ORDER_STATUSES);
    const paymentMethod = pickRandom(PAYMENT_METHODS);
    const paymentStatus: PaymentStatus =
      status === OrderStatus.DELIVERED || status === OrderStatus.SHIPPING
        ? PaymentStatus.PAID
        : paymentMethod !== 'cod' && faker.datatype.boolean({ probability: 0.6 })
          ? PaymentStatus.PAID
          : PaymentStatus.UNPAID;

    // 1–4 items per order
    const itemCount = faker.number.int({ min: 1, max: 4 });
    const selectedVariants = faker.helpers.arrayElements(variants, itemCount);

    const shippingFee = faker.number.int({ min: 15000, max: 50000 });
    let subtotal = 0;

    const shippingAddress = address
      ? {
          fullName: address.fullName,
          phone: address.phone,
          addressLine: address.addressLine,
          city: address.city,
        }
      : {
          fullName: user.fullName,
          phone: user.phone ?? '0900000000',
          addressLine: faker.location.streetAddress(),
          city: 'Ho Chi Minh City',
        };

    // Calculate subtotal first
    const itemData = selectedVariants.map((variant) => {
      const product = productMap.get(variant.productId);
      const quantity = faker.number.int({ min: 1, max: 3 });
      const price = variant.salePrice ?? variant.price;
      subtotal += Number(price) * quantity;
      return { variant, product, quantity, price };
    });

    const totalAmount = subtotal + shippingFee;

    // Insert order directly
    const insertResult = await orderRepo
      .createQueryBuilder()
      .insert()
      .into(Order)
      .values({
        userId: user.id,
        status,
        paymentMethod,
        paymentStatus,
        shippingFee,
        totalAmount,
        shippingAddress,
      })
      .execute();

    const orderId = insertResult.identifiers[0].id as number;

    // Insert order items
    await orderItemRepo.save(
      itemData.map(({ variant, product, quantity, price }) => ({
        orderId,
        productVariantId: variant.id,
        productName: product?.name ?? 'Unknown Product',
        sku: variant.sku,
        price,
        quantity,
        thumbnailUrl: product?.thumbnailUrl ?? null,
      })),
    );

    seededCount++;
  }

  console.log(`✓ Seeded ${seededCount} orders with items`);
}
