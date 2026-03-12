import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  customerId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ nullable: true })
  mode: string;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;
}
