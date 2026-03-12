import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('scheme_configs')
export class SchemeConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // Config name, e.g. "default"

  @Column({ type: 'jsonb' })
  config: Record<string, string[]>; // { "customer": ["name", "region"], "product": ["name", "category"] }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
