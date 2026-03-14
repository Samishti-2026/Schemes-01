import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('billing')
export class Billing {
  @PrimaryColumn('numeric')
  billing_doc: number;

  @Column({ nullable: true })
  billing_type: string;

  @Column({ nullable: true })
  billing_category: string;

  @Column({ nullable: true })
  document_cat: string;

  @Column({ nullable: true })
  doc_currency: string;

  @Column('numeric', { nullable: true })
  sales_org: number;

  @Column('numeric', { nullable: true })
  distr_channel: number;

  @Column({ nullable: true })
  pric_procedure: string;

  @Column('numeric', { nullable: true })
  doc_condition: number;

  @Column('numeric', { nullable: true })
  shipping_conditions: number;

  @Column({ type: 'date', nullable: true })
  billing_date: Date;

  @Column('numeric', { nullable: true })
  document_number: number;

  @Column('numeric', { nullable: true })
  fiscal_year: number;

  @Column('numeric', { nullable: true })
  posting_period: number;

  @Column({ nullable: true })
  custprice_group: string;

  @Column({ nullable: true })
  customer_group: string;

  @Column({ nullable: true })
  sales_district: string;

  @Column({ nullable: true })
  price_list_tp: string;

  @Column({ nullable: true })
  incoterms: string;

  @Column({ nullable: true })
  incoterms_2: string;

  @Column({ nullable: true })
  posting_status: string;

  @Column({ nullable: true })
  pyt_terms: string;

  @Column({ nullable: true })
  payt_method: string;

  @Column('numeric', { nullable: true })
  accassmtgrpcust: number;

  @Column({ nullable: true })
  dest_ctry_reg: string;

  @Column('numeric', { nullable: true })
  region: number;

  @Column('numeric', { nullable: true })
  county_code: number;

  @Column('numeric', { nullable: true })
  city_code: number;

  @Column('numeric', { nullable: true })
  company_code: number;

  @Column('numeric', { nullable: true })
  payer: number;

  @Column({ nullable: true })
  vat_reg_no: string;

  @Column({ nullable: true })
  canceld_bill_dc: string;

  @Column({ nullable: true })
  agreement: string;

  @Column('numeric', { nullable: true })
  division: number;

  @Column({ nullable: true })
  cust_reference: string;

  @Column({ nullable: true })
  reference: string;

  @Column('numeric', { nullable: true })
  assignment: number;

  @Column({ nullable: true })
  canceled: string;

  @Column('numeric', { nullable: true })
  business_place: number;

  @Column({ nullable: true })
  payment_terms: string;

  @Column('numeric', { nullable: true })
  shipping_type: number;

  @Column('numeric', { nullable: true })
  mns_of_trns_type: number;

  @Column('numeric', { nullable: true })
  item: number;

  @Column('numeric', { nullable: true })
  higher_lev_item: number;

  @Column('numeric', { nullable: true })
  invoiced_qty: number;

  @Column({ nullable: true })
  sales_unit: string;

  @Column('numeric', { nullable: true })
  net_weight: number;

  @Column('numeric', { nullable: true })
  gross_weight: number;

  @Column({ nullable: true })
  unit_of_weight: string;

  @Column('numeric', { nullable: true })
  volume: number;

  @Column({ nullable: true })
  volume_unit: string;

  @Column('numeric', { nullable: true })
  business_area: number;

  @Column({ type: 'date', nullable: true })
  pricing_date: Date;

  @Column('numeric', { nullable: true })
  net_value: number;

  @Column('numeric', { nullable: true })
  reference_doc: number;

  @Column('numeric', { nullable: true })
  reference_item: number;

  @Column({ nullable: true })
  prec_doc_categ: string;

  @Column('numeric', { nullable: true })
  sales_document: number;

  @Column('numeric', { nullable: true })
  item_sales: number;

  @Column('numeric', { nullable: true })
  material: number;

  @Column({ nullable: true })
  item_descr: string;

  @Column({ nullable: true })
  batch: string;

  @Column('numeric', { nullable: true })
  material_group: number;

  @Column({ nullable: true })
  item_category: string;

  @Column('numeric', { nullable: true })
  shipping_point: number;

  @Column({ nullable: true })
  replacemt_part: string;

  @Column('numeric', { nullable: true })
  division_item: number;

  @Column('numeric', { nullable: true })
  partner_item: number;

  @Column('numeric', { nullable: true })
  plant: number;

  @Column({ nullable: true })
  dep_ctry_reg: string;

  @Column('numeric', { nullable: true })
  region_dlv_plnt: number;

  @Column({ nullable: true })
  mat_price_grp: string;

  @Column('numeric', { nullable: true })
  acctassmtgrpmat: number;

  @Column({ nullable: true })
  mat_price_grp_2: string;

  @Column('numeric', { nullable: true })
  acctassmtgrpmat_2: number;

  @Column('numeric', { nullable: true })
  cost_center: number;

  @Column({ nullable: true })
  vol_rebate_grp: string;

  @Column({ nullable: true })
  commission_grp: string;

  @Column({ nullable: true })
  sales_group: string;

  @Column({ nullable: true })
  sales_office: string;

  @Column({ nullable: true })
  valuation_type: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  profit_center: string;

  @Column({ nullable: true })
  customer_grp_1: string;

  @Column({ nullable: true })
  customer_grp_2: string;

  @Column({ nullable: true })
  customer_grp_3: string;

  @Column({ nullable: true })
  customer_grp_4: string;

  @Column({ nullable: true })
  customer_grp_5: string;

  @Column({ nullable: true })
  materialgroup_1: string;

  @Column({ nullable: true })
  materialgroup_2: string;

  @Column({ nullable: true })
  materialgroup_3: string;

  @Column({ nullable: true })
  materialgroup_4: string;

  @Column({ nullable: true })
  materialgroup_5: string;

  @Column({ nullable: true })
  tax_jur: string;

  @Column('numeric', { nullable: true })
  tax_amount: number;

  @Column({ nullable: true })
  condition_grp_1: string;

  @Column({ nullable: true })
  condition_grp_2: string;

  @Column({ nullable: true })
  condition_grp_3: string;

  @Column({ nullable: true })
  condition_grp_4: string;

  @Column({ nullable: true })
  condition_grp_5: string;
}
