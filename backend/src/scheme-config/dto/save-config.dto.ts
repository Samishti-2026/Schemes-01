import { IsString, IsObject, IsOptional } from 'class-validator';

export class SaveConfigDto {
  @IsOptional()
  @IsString()
  name?: string; // defaults to "default"

  @IsObject()
  config: Record<string, string[]>;
}
