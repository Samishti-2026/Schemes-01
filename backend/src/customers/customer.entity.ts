import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentTO: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  avgDaily: number;

  @Column({ nullable: true })
  paymentStatus: string;

  @Column({ type: 'text', nullable: true })
  products: string;

  @CreateDateColumn()
  createdAt: Date;
}
