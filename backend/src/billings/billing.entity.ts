import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('billings')
export class Billing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  invoiceNo: string;

  @Column({ nullable: true })
  customerId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'date', nullable: true })
  billingDate: string;

  @Column({ type: 'date', nullable: true })
  dueDate: string;

  @CreateDateColumn()
  createdAt: Date;
}
