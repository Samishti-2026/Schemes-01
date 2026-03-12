import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Executive' })
  displayName: string;

  @Column({ default: 'executive@samishti.com' })
  email: string;

  @Column({ default: true })
  emailAlerts: boolean;

  @Column({ default: true })
  weeklyReports: boolean;

  @Column({ default: true })
  systemUpdates: boolean;
}
