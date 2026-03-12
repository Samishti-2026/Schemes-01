import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateSchemeDto {
  @IsString()
  schemeName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  targetType?: string;

  @IsOptional()
  @IsString()
  selectedTargetItem?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsString()
  targetUnit?: string;

  @IsOptional()
  @IsArray()
  rules?: { field: string; operator: string; value: string }[];

  @IsOptional()
  @IsNumber()
  totalBudget?: number;

  @IsOptional()
  @IsNumber()
  maxQualifiers?: number;

  @IsOptional()
  @IsString()
  payoutType?: string;

  @IsOptional()
  @IsNumber()
  payoutAmount?: number;

  @IsOptional()
  @IsNumber()
  payoutPerPerson?: number;

  @IsOptional()
  @IsString()
  recipientType?: string;

  @IsOptional()
  @IsString()
  regionFilter?: string;
}
