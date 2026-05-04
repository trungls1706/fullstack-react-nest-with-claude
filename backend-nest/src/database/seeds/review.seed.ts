import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Review } from '../../features/review/entities/review.entity';
import { Order } from '../../features/order/entities/order.entity';
import { OrderItem } from '../../features/order/entities/order-item.entity';
import { ProductVariant } from '../../features/product/entities/product-variant.entity';
import { OrderStatus } from '../../features/order/types/order-status.type';
import { seedOrder } from './order.seed';

const REVIEW_COMMENTS = [
  'Great product! Exactly as described.',
  'Very good quality, will buy again.',
  'Fast shipping, product is perfect.',
  'Good value for the price.',
  'Exceeded my expectations!',
  'Decent product, nothing special.',
  'Product is okay, delivery was slow.',
  'Not bad, but could be better.',
  'Amazing quality, highly recommend!',
  'Satisfied with my purchase.',
  'The product looks great and works well.',
  'Good packaging and fast delivery.',
  null, // no comment
  null,
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedReview(dataSource: DataSource) {
  await seedOrder(dataSource);

  const reviewRepo = dataSource.getRepository(Review);
  if ((await reviewRepo.count()) > 0) {
    console.log('⏭ Reviews already seeded');
    return;
  }

  const orderRepo = dataSource.getRepository(Order);
  const orderItemRepo = dataSource.getRepository(OrderItem);
  const variantRepo = dataSource.getRepository(ProductVariant);

  // Only delivered orders can have reviews
  const deliveredOrders = await orderRepo.findBy({ status: OrderStatus.DELIVERED });

  if (deliveredOrders.length === 0) {
    console.log('⚠ No delivered orders found, skipping reviews');
    return;
  }

  const reviews: Partial<Review>[] = [];
  const reviewedSet = new Set<string>(); // userId-productId-orderId

  for (const order of deliveredOrders) {
    // ~70% chance to leave a review
    if (!faker.datatype.boolean({ probability: 0.7 })) continue;

    const orderItems = await orderItemRepo.findBy({ orderId: order.id });

    for (const item of orderItems) {
      const variant = await variantRepo.findOne({ where: { id: item.productVariantId } });
      if (!variant) continue;

      const key = `${order.userId}-${variant.productId}-${order.id}`;
      if (reviewedSet.has(key)) continue;
      reviewedSet.add(key);

      // Delivered orders lean toward positive reviews
      const rating = faker.helpers.weightedArrayElement([
        { value: 5, weight: 40 },
        { value: 4, weight: 30 },
        { value: 3, weight: 15 },
        { value: 2, weight: 10 },
        { value: 1, weight: 5 },
      ]);

      reviews.push({
        userId: order.userId,
        productId: variant.productId,
        orderId: order.id,
        rating,
        comment: pickRandom(REVIEW_COMMENTS) as string | null,
      });
    }
  }

  if (reviews.length === 0) {
    console.log('⚠ No reviews generated (no delivered orders with items)');
    return;
  }

  await reviewRepo.save(reviews);
  console.log(`✓ Seeded ${reviews.length} reviews from ${deliveredOrders.length} delivered orders`);
}
