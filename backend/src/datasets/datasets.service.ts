import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface FieldDef {
  name: string;
  type: string;
}

export interface DatasetDef {
  name: string;
  fields: FieldDef[];
}

@Injectable()
export class DatasetsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async findAll(): Promise<DatasetDef[]> {
    const rows: { table_name: string; column_name: string; data_type: string }[] =
      await this.dataSource.query(`
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `);

    const map = new Map<string, FieldDef[]>();
    for (const row of rows) {
      if (!map.has(row.table_name)) map.set(row.table_name, []);
      map.get(row.table_name)!.push({ name: row.column_name, type: row.data_type });
    }

    return Array.from(map.entries()).map(([name, fields]) => ({ name, fields }));
  }
}