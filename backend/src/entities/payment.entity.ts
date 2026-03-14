import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('payment')
export class Payment {
  @PrimaryColumn('numeric')
  company_code: number;

  @PrimaryColumn('numeric')
  bill_doc: number;

  @PrimaryColumn('numeric')
  customer_number: number;

  @PrimaryColumn('numeric')
  accounting_document: number;

  @PrimaryColumn('numeric')
  item_num: number;

  @Column({ nullable: true })
  special_gl_indicator: string;

  @Column({ type: 'date', nullable: true })
  clearing_date: Date;

  @Column('numeric', { nullable: true })
  clearing_document: number;

  @Column('numeric', { nullable: true })
  assignment_number: number;

  @Column('numeric', { nullable: true })
  fiscal_year: number;

  @Column({ type: 'date', nullable: true })
  posting_date: Date;

  @Column({ type: 'date', nullable: true })
  document_date: Date;

  @Column({ type: 'date', nullable: true })
  entry_date: Date;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  local_currency: string;

  @Column({ nullable: true })
  reference_document_number: string;

  @Column({ nullable: true })
  document_type: string;

  @Column('numeric', { nullable: true })
  fiscal_period: number;

  @Column('numeric', { nullable: true })
  posting_key: number;

  @Column({ nullable: true })
  debit_credit_indicator: string;

  @Column('numeric', { nullable: true })
  business_area: number;

  @Column({ nullable: true })
  tax_code: string;

  @Column({ nullable: true })
  item_text: string;

  @Column('numeric', { nullable: true })
  branch: number;

  @Column({ type: 'date', nullable: true })
  baseline_date: Date;

  @Column({ nullable: true })
  terms_of_payment: string;

  @Column('numeric', { nullable: true })
  amount: number;

  @Column('numeric', { nullable: true })
  inv_ref: number;

  @Column('numeric', { nullable: true })
  inv_year: number;

  @Column('numeric', { nullable: true })
  inv_item: number;
}
