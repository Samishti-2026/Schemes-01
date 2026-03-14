import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('schemes')
export class Scheme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column()
  status: string;

  @Column()
  targetType: string;

  @Column({ nullable: true })
  selectedTargetItem: string;

  @Column('numeric', { nullable: true })
  totalBudget: number;

  @Column({ nullable: true })
  maxQualifiers: number;

  @Column('numeric', { nullable: true })
  payoutPerPerson: number;

  @Column()
  recipientType: string;

  @Column()
  regionFilter: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  category: string;

  @Column()
  targets: number;

  @Column({ nullable: true })
  revenue: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column('numeric', { nullable: true })
  targetValue: number;

  @Column()
  targetUnit: string;

  @Column('jsonb', { nullable: true })
  rules: any;

  @Column({ nullable: true })
  payoutType: string;

  @Column('numeric', { nullable: true })
  payoutAmount: number;
}
