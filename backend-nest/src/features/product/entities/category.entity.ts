import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true, eager: false })
  @JoinColumn({ name: 'parent_id' })
  parent: Category | null;

  @Column({ name: 'parent_id', type: 'bigint', nullable: true })
  parentId: number | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index('idx_categories_slug')
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;
}
