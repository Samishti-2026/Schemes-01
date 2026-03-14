import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('material')
export class Material {
  @PrimaryColumn('numeric')
  material: number;

  @Column({ nullable: true })
  old_matl_number: string;

  @Column({ nullable: true })
  material_description: string;

  @Column({ nullable: true })
  uom: string;

  @Column('numeric', { nullable: true })
  plant: number;

  @Column({ nullable: true })
  material_type: string;

  @Column('numeric', { nullable: true })
  material_group: number;

  @Column({ nullable: true })
  ext_matl_group: string;

  @Column('numeric', { nullable: true })
  gross_weight: number;

  @Column('numeric', { nullable: true })
  net_weight: number;

  @Column({ nullable: true })
  unit_of_weight: string;

  @Column('numeric', { nullable: true })
  volume: number;

  @Column({ nullable: true })
  basic_material: string;

  @Column({ nullable: true })
  manufacturer_book_part_number: string;

  @Column({ nullable: true })
  medium: string;

  @Column('numeric', { nullable: true })
  sales_org: number;

  @Column('numeric', { nullable: true })
  dist_channel: number;

  @Column('numeric', { nullable: true })
  division: number;

  @Column({ nullable: true })
  material_price_grp: string;

  @Column('numeric', { nullable: true })
  acct_assmt_grp_mat: number;

  @Column({ nullable: true })
  item_category_group: string;

  @Column({ nullable: true })
  volume_rebate_group: string;

  @Column({ nullable: true })
  commission_group: string;

  @Column({ nullable: true })
  material_group_1: string;

  @Column({ nullable: true })
  material_group_2: string;

  @Column({ nullable: true })
  material_group_3: string;

  @Column({ nullable: true })
  material_group_4: string;

  @Column({ nullable: true })
  material_group_5: string;

  @Column({ nullable: true })
  material_freight_grp: string;

  @Column({ nullable: true })
  profit_center: string;

  @Column('numeric', { nullable: true })
  control_code: number;

  @Column({ nullable: true })
  intrastat_group: string;

  @Column({ nullable: true })
  cas_number_pharm: string;

  @Column({ nullable: true })
  prodcom_no: string;
}
