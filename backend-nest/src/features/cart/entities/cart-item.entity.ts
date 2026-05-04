import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariant } from '../../product/entities/product-variant.entity';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'cart_id', type: 'bigint' })
  cartId: number;

  @ManyToOne(() => ProductVariant, { eager: false })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant;

  @Column({ name: 'product_variant_id', type: 'bigint' })
  productVariantId: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
