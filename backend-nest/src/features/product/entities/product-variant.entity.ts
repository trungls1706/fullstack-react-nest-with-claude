import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
@Index('idx_product_variants_sku', ['sku'])
export class ProductVariant {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Product, (product) => product.variants, { eager: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id', type: 'bigint' })
  productId: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  size: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ name: 'sale_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  salePrice: number | null;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;
}
