import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  // Lazy relation — users loaded only when needed
  @OneToMany('User', 'role')
  users: Promise<unknown[]>;
}
