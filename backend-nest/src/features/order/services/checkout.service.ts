import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AddressRepository } from '../../user-profile/repositories/address.repository';
import { CartRepository } from '../../cart/repositories/cart.repository';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { ProductVariant } from '../../product/entities/product-variant.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderRepository } from '../repositories/order.repository';
import { OrderStatus, PaymentStatus, ShippingAddressSnapshot } from '../types/order-status.type';

const SHIPPING_FEE = 30000;

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly addressRepository: AddressRepository,
    private readonly orderRepository: OrderRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async checkout(userId: number, dto: CreateOrderDto): Promise<Order> {
    this.logger.log(`Checkout initiated for user #${userId}`);

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const address = await this.addressRepository.findOneByIdAndUserId(dto.addressId, userId);
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      let subtotal = 0;
      const orderItemsPayload: Partial<OrderItem>[] = [];

      for (const cartItem of cart.items) {
        const variant = await qr.manager.findOne(ProductVariant, {
          where: { id: cartItem.productVariantId },
          relations: ['product'],
          lock: { mode: 'pessimistic_write' },
        });

        if (!variant) {
          throw new NotFoundException(`Variant #${cartItem.productVariantId} not found`);
        }

        if (variant.stockQuantity < cartItem.quantity) {
          throw new BadRequestException(`Insufficient stock for SKU: ${variant.sku}`);
        }

        const price = Number(variant.salePrice ?? variant.price);
        subtotal += price * cartItem.quantity;

        orderItemsPayload.push({
          productVariantId: variant.id,
          productName: variant.product.name,
          sku: variant.sku,
          price,
          quantity: cartItem.quantity,
          thumbnailUrl: variant.product.thumbnailUrl ?? null,
        });
      }

      const shippingAddress: ShippingAddressSnapshot = {
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        city: address.city,
      };

      const order = qr.manager.create(Order, {
        userId,
        status: OrderStatus.PENDING,
        paymentMethod: dto.paymentMethod,
        paymentStatus: PaymentStatus.UNPAID,
        shippingFee: SHIPPING_FEE,
        totalAmount: subtotal + SHIPPING_FEE,
        shippingAddress,
      });
      const savedOrder = await qr.manager.save(Order, order);

      for (const itemPayload of orderItemsPayload) {
        await qr.manager.save(
          OrderItem,
          qr.manager.create(OrderItem, { ...itemPayload, orderId: savedOrder.id }),
        );

        await qr.manager.decrement(
          ProductVariant,
          { id: itemPayload.productVariantId },
          'stockQuantity',
          itemPayload.quantity!,
        );
      }

      await qr.manager.delete(CartItem, { cartId: cart.id });

      await qr.commitTransaction();

      this.logger.log(`Order #${savedOrder.id} created for user #${userId}`);
      return (await this.orderRepository.findById(savedOrder.id))!;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }
}
