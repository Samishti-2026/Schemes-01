import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenant')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ name: 'logourl', nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  color: string;

  @Column({ name: 'isactive', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdat', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedat', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'dbname', nullable: true })
  dbName: string;
}
