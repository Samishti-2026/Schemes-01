import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('customer')
export class Customer {
  @PrimaryColumn('numeric')
  customer_code: number;

  @Column('numeric', { nullable: true })
  supplier: number;

  @Column({ nullable: true })
  customer_name: string;

  @Column({ nullable: true })
  search_term_1: string;

  @Column({ nullable: true })
  acount_grp: string;

  @Column({ nullable: true })
  country: string;

  @Column('numeric', { nullable: true })
  region: number;

  @Column('numeric', { nullable: true })
  postal_code: number;

  @Column('numeric', { nullable: true })
  nielsen_indicator: number;

  @Column({ nullable: true })
  regional_market: string;

  @Column({ nullable: true })
  customer_classific: string;

  @Column({ nullable: true })
  industry_code_1: string;

  @Column({ nullable: true })
  industry_code_2: string;

  @Column({ nullable: true })
  industry_code_3: string;

  @Column({ nullable: true })
  industry_code_4: string;

  @Column({ nullable: true })
  industry_code_5: string;

  @Column({ nullable: true })
  condition_group_1: string;

  @Column({ nullable: true })
  condition_group_2: string;

  @Column({ nullable: true })
  condition_group_3: string;

  @Column({ nullable: true })
  condition_group_4: string;

  @Column({ nullable: true })
  condition_group_5: string;

  @Column({ nullable: true })
  terms_of_payment: string;

  @Column('numeric', { nullable: true })
  reconciliation_account: number;

  @Column('numeric', { nullable: true })
  sales_org: number;

  @Column('numeric', { nullable: true })
  distr_channel: number;

  @Column('numeric', { nullable: true })
  division: number;

  @Column({ nullable: true })
  sales_district: string;

  @Column({ nullable: true })
  customer_group: string;

  @Column({ nullable: true })
  sales_office: string;

  @Column({ nullable: true })
  sales_group: string;

  @Column({ nullable: true })
  abc_analysis: string;

  @Column({ nullable: true })
  price_group: string;

  @Column({ nullable: true })
  cust_pric_procedure: string;

  @Column({ nullable: true })
  price_list: string;

  @Column('numeric', { nullable: true })
  delivery_priority: number;

  @Column('numeric', { nullable: true })
  shipping_conditions: number;

  @Column({ nullable: true })
  incoterms: string;

  @Column('numeric', { nullable: true })
  acct_assmt_grp_cust: number;

  @Column({ nullable: true })
  customer_group_1: string;

  @Column({ nullable: true })
  customer_group_2: string;

  @Column({ nullable: true })
  customer_group_3: string;

  @Column({ nullable: true })
  customer_group_4: string;

  @Column({ nullable: true })
  customer_group_5: string;

  @Column('numeric', { nullable: true })
  bill_to_party: number;

  @Column('numeric', { nullable: true })
  payer: number;

  @Column('numeric', { nullable: true })
  ship_to_party: number;

  @Column('numeric', { nullable: true })
  other_partner: number;
}
