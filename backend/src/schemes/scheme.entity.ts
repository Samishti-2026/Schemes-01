import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('schemes')
export class Scheme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({ default: 'upcoming' })
  status: string; // active | expired | upcoming

  @Column({ default: 'total_sales' })
  targetType: string; // product_qty | category_qty | total_sales | adv_payment

  @Column({ nullable: true })
  selectedTargetItem: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  targetValue: number;

  @Column({ default: 'amount' })
  targetUnit: string; // amount | quantity | percentage

  @Column({ type: 'jsonb', nullable: true })
  rules: { field: string; operator: string; value: string }[];

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalBudget: number;

  @Column({ nullable: true })
  maxQualifiers: number;

  @Column({ nullable: true })
  payoutType: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  payoutAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  payoutPerPerson: number;

  @Column({ default: 'customer' })
  recipientType: string; // customer | distributor | sales_exec

  @Column({ default: 'all' })
  regionFilter: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 0 })
  targets: number;

  @Column({ nullable: true })
  revenue: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
