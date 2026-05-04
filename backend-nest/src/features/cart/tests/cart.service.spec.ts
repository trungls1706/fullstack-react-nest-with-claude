import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariantRepository } from '../../product/repositories/product-variant.repository';
import { CartService } from '../cart.service';
import { CartItem } from '../entities/cart-item.entity';
import { Cart } from '../entities/cart.entity';
import { CartItemRepository } from '../repositories/cart-item.repository';
import { CartRepository } from '../repositories/cart.repository';

const mockCart = (overrides: Partial<Cart> = {}): Cart => ({
  id: 1,
  userId: null,
  sessionId: 'session-abc',
  user: null,
  items: [],
  createdAt: new Date(),
  ...overrides,
});

const mockItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 1,
  cartId: 1,
  cart: mockCart(),
  productVariantId: 10,
  productVariant: null as any,
  quantity: 2,
  ...overrides,
});

describe('CartService', () => {
  let service: CartService;
  let cartRepo: jest.Mocked<CartRepository>;
  let cartItemRepo: jest.Mocked<CartItemRepository>;
  let variantRepo: jest.Mocked<ProductVariantRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepository,
          useValue: {
            findByUserId: jest.fn(),
            findBySessionId: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CartItemRepository,
          useValue: {
            findByCartIdAndVariantId: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            deleteByCartId: jest.fn(),
          },
        },
        {
          provide: ProductVariantRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepo = module.get(CartRepository);
    cartItemRepo = module.get(CartItemRepository);
    variantRepo = module.get(ProductVariantRepository);
  });

  describe('getCart', () => {
    it('should return existing cart by sessionId', async () => {
      const cart = mockCart();
      cartRepo.findBySessionId.mockResolvedValue(cart);

      const result = await service.getCart(null, 'session-abc');

      expect(cartRepo.findBySessionId).toHaveBeenCalledWith('session-abc');
      expect(result.cart).toEqual(cart);
      expect(result.newSessionId).toBeUndefined();
    });

    it('should create a new guest cart when none exists', async () => {
      const newCart = mockCart({ sessionId: 'new-uuid' });
      cartRepo.findBySessionId.mockResolvedValue(null);
      cartRepo.save.mockResolvedValue(newCart);

      const result = await service.getCart(null, null);

      expect(result.newSessionId).toBeDefined();
      expect(cartRepo.save).toHaveBeenCalled();
    });

    it('should return cart by userId for logged-in user', async () => {
      const cart = mockCart({ userId: 5, sessionId: null });
      cartRepo.findByUserId.mockResolvedValue(cart);

      const result = await service.getCart(5, null);

      expect(cartRepo.findByUserId).toHaveBeenCalledWith(5);
      expect(result.cart.userId).toBe(5);
    });
  });

  describe('addItem', () => {
    it('should add a new item to cart', async () => {
      const cart = mockCart();
      const updatedCart = { ...cart, items: [mockItem()] };
      variantRepo.findById.mockResolvedValue({ id: 10 } as any);
      cartRepo.findBySessionId.mockResolvedValue(cart);
      cartItemRepo.findByCartIdAndVariantId.mockResolvedValue(null);
      cartItemRepo.save.mockResolvedValue(mockItem());
      cartRepo.findById.mockResolvedValue(updatedCart as any);

      const result = await service.addItem(null, 'session-abc', {
        productVariantId: 10,
        quantity: 2,
      });

      expect(cartItemRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ productVariantId: 10, quantity: 2 }),
      );
      expect(result.cart.items).toHaveLength(1);
    });

    it('should increment quantity if item already in cart', async () => {
      const cart = mockCart();
      const existingItem = mockItem({ quantity: 1 });
      variantRepo.findById.mockResolvedValue({ id: 10 } as any);
      cartRepo.findBySessionId.mockResolvedValue(cart);
      cartItemRepo.findByCartIdAndVariantId.mockResolvedValue(existingItem);
      cartItemRepo.save.mockResolvedValue({ ...existingItem, quantity: 3 });
      cartRepo.findById.mockResolvedValue(cart as any);

      await service.addItem(null, 'session-abc', { productVariantId: 10, quantity: 2 });

      expect(cartItemRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 3 }),
      );
    });

    it('should throw NotFoundException when variant not found', async () => {
      variantRepo.findById.mockResolvedValue(null);

      await expect(
        service.addItem(null, 'session-abc', { productVariantId: 99, quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateItem', () => {
    it('should update item quantity', async () => {
      const item = mockItem();
      const updatedCart = mockCart();
      cartItemRepo.findById.mockResolvedValue(item);
      cartRepo.findById
        .mockResolvedValueOnce(mockCart()) // assertCartOwnership
        .mockResolvedValueOnce(updatedCart); // return updated cart
      cartItemRepo.save.mockResolvedValue({ ...item, quantity: 5 });

      const result = await service.updateItem(1, null, 'session-abc', { quantity: 5 });

      expect(cartItemRepo.save).toHaveBeenCalledWith(expect.objectContaining({ quantity: 5 }));
    });

    it('should throw NotFoundException when item not found', async () => {
      cartItemRepo.findById.mockResolvedValue(null);
      await expect(service.updateItem(99, null, 'session-abc', { quantity: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeItem', () => {
    it('should remove a cart item', async () => {
      cartItemRepo.findById.mockResolvedValue(mockItem());
      cartRepo.findById.mockResolvedValue(mockCart());

      await service.removeItem(1, null, 'session-abc');

      expect(cartItemRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('clearCart', () => {
    it('should delete all items from cart', async () => {
      cartRepo.findBySessionId.mockResolvedValue(mockCart());

      await service.clearCart(null, 'session-abc');

      expect(cartItemRepo.deleteByCartId).toHaveBeenCalledWith(1);
    });

    it('should do nothing when cart does not exist', async () => {
      cartRepo.findBySessionId.mockResolvedValue(null);

      await service.clearCart(null, 'unknown-session');

      expect(cartItemRepo.deleteByCartId).not.toHaveBeenCalled();
    });
  });

  describe('mergeGuestCart', () => {
    it('should merge guest items into user cart', async () => {
      const guestCart = mockCart({ sessionId: 'session-abc', items: [mockItem()] });
      const userCart = mockCart({ id: 2, userId: 5, sessionId: null, items: [] });
      cartRepo.findBySessionId.mockResolvedValue(guestCart);
      cartRepo.findByUserId.mockResolvedValue(userCart);
      cartItemRepo.findByCartIdAndVariantId.mockResolvedValue(null);
      cartItemRepo.save.mockResolvedValue(mockItem());
      cartRepo.findById.mockResolvedValue({ ...userCart, items: [mockItem()] } as any);

      const result = await service.mergeGuestCart(5, 'session-abc');

      expect(cartItemRepo.save).toHaveBeenCalled();
      expect(cartRepo.delete).toHaveBeenCalledWith(guestCart.id);
    });
  });
});
