import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ProductVariantRepository } from '../product/repositories/product-variant.repository';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Cart } from './entities/cart.entity';
import { CartItemRepository } from './repositories/cart-item.repository';
import { CartRepository } from './repositories/cart.repository';

export const CART_SESSION_COOKIE = 'cart_session_id';

export interface CartResult {
  cart: Cart;
  newSessionId?: string;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemRepository: CartItemRepository,
    private readonly variantRepository: ProductVariantRepository,
  ) {}

  async getCart(userId: number | null, sessionId: string | null): Promise<CartResult> {
    const cart = await this.resolveCart(userId, sessionId);
    if (!cart) {
      const newSessionId = randomUUID();
      const emptyCart = await this.cartRepository.save({
        userId: null,
        sessionId: newSessionId,
        items: [],
      });
      return { cart: emptyCart, newSessionId };
    }
    return { cart };
  }

  async addItem(
    userId: number | null,
    sessionId: string | null,
    dto: AddCartItemDto,
  ): Promise<CartResult> {
    const variant = await this.variantRepository.findById(dto.productVariantId);
    if (!variant) {
      throw new NotFoundException(`Variant #${dto.productVariantId} not found`);
    }

    let newSessionId: string | undefined;
    let cart = await this.resolveCart(userId, sessionId);

    if (!cart) {
      newSessionId = randomUUID();
      cart = await this.cartRepository.save({
        userId,
        sessionId: userId ? null : newSessionId,
        items: [],
      });
    }

    const existingItem = await this.cartItemRepository.findByCartIdAndVariantId(
      cart.id,
      dto.productVariantId,
    );

    if (existingItem) {
      await this.cartItemRepository.save({
        ...existingItem,
        quantity: existingItem.quantity + dto.quantity,
      });
    } else {
      await this.cartItemRepository.save({
        cartId: cart.id,
        productVariantId: dto.productVariantId,
        quantity: dto.quantity,
      });
    }

    const updated = await this.cartRepository.findById(cart.id);
    return { cart: updated!, newSessionId };
  }

  async updateItem(
    itemId: number,
    userId: number | null,
    sessionId: string | null,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const item = await this.cartItemRepository.findById(itemId);
    if (!item) throw new NotFoundException(`Cart item #${itemId} not found`);

    await this.assertCartOwnership(item.cart.id, userId, sessionId);

    await this.cartItemRepository.save({ ...item, quantity: dto.quantity });

    return (await this.cartRepository.findById(item.cart.id))!;
  }

  async removeItem(
    itemId: number,
    userId: number | null,
    sessionId: string | null,
  ): Promise<void> {
    const item = await this.cartItemRepository.findById(itemId);
    if (!item) throw new NotFoundException(`Cart item #${itemId} not found`);

    await this.assertCartOwnership(item.cart.id, userId, sessionId);
    await this.cartItemRepository.delete(itemId);
  }

  async clearCart(userId: number | null, sessionId: string | null): Promise<void> {
    const cart = await this.resolveCart(userId, sessionId);
    if (!cart) return;
    await this.cartItemRepository.deleteByCartId(cart.id);
  }

  async mergeGuestCart(userId: number, sessionId: string): Promise<Cart> {
    this.logger.log(`Merging guest cart (session: ${sessionId}) into user #${userId}`);

    const guestCart = await this.cartRepository.findBySessionId(sessionId);
    if (!guestCart || guestCart.items.length === 0) {
      const userCart = await this.cartRepository.findByUserId(userId);
      if (userCart) return userCart;
      return this.cartRepository.save({ userId, sessionId: null, items: [] });
    }

    let userCart = await this.cartRepository.findByUserId(userId);
    if (!userCart) {
      userCart = await this.cartRepository.save({ userId, sessionId: null, items: [] });
    }

    for (const guestItem of guestCart.items) {
      const existing = await this.cartItemRepository.findByCartIdAndVariantId(
        userCart.id,
        guestItem.productVariantId,
      );

      if (existing) {
        await this.cartItemRepository.save({
          ...existing,
          quantity: existing.quantity + guestItem.quantity,
        });
      } else {
        await this.cartItemRepository.save({
          cartId: userCart.id,
          productVariantId: guestItem.productVariantId,
          quantity: guestItem.quantity,
        });
      }
    }

    await this.cartRepository.delete(guestCart.id);

    return (await this.cartRepository.findById(userCart.id))!;
  }

  private async resolveCart(
    userId: number | null,
    sessionId: string | null,
  ): Promise<Cart | null> {
    if (userId) return this.cartRepository.findByUserId(userId);
    if (sessionId) return this.cartRepository.findBySessionId(sessionId);
    return null;
  }

  private async assertCartOwnership(
    cartId: number,
    userId: number | null,
    sessionId: string | null,
  ): Promise<void> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) throw new NotFoundException('Cart not found');

    const owned =
      (userId && cart.userId === userId) ||
      (sessionId && cart.sessionId === sessionId);

    if (!owned) throw new NotFoundException('Cart item not found');
  }
}
