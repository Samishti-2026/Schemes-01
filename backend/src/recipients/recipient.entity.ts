import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('recipients')
export class Recipient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentTO: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  avgDaily: number;

  @Column({ nullable: true })
  category: string; // Electronics, Home Appliances, Furniture, etc.

  @Column({ nullable: true })
  type: string; // Dealer, Retailer

  @Column({ nullable: true })
  region: string; // North, South, East, West

  @Column({ nullable: true })
  paymentStatus: string; // Pending, Completed, Failed

  @Column({ nullable: true })
  invoiceDate: string;

  @Column({ nullable: true })
  paymentDate: string;

  @Column('simple-array', { nullable: true })
  products: string[]; // List of products they deal in

  @Column({ default: 'customer' })
  recipientType: string; // customer | distributor | sales_executive
}
