import { Controller, Get, Query, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { Material } from '../entities/material.entity';
import { Billing } from '../entities/billing.entity';
import { Payment } from '../entities/payment.entity';

@Controller()
export class DatasetsController {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) { }

  @Get('datasets')
  async getDatasets() {
    if (!this.dataSource) {
      return { database: 'none', datasets: [] };
    }

    const entities = [
      { name: 'customer', entity: Customer },
      { name: 'material', entity: Material },
      { name: 'billing', entity: Billing },
      { name: 'payment', entity: Payment },
    ];

    const fieldsData = entities.map(({ name, entity }) => {
      const metadata = this.dataSource.getMetadata(entity);
      const fields = metadata.columns.map(column => {
        let type = 'string';
        const columnType = column.type?.toString().toLowerCase();

        if (['numeric', 'integer', 'int4', 'decimal', 'float'].some(t => columnType?.includes(t))) {
          type = 'number';
        } else if (['timestamp', 'date'].some(t => columnType?.includes(t))) {
          type = 'date';
        }

        return {
          name: column.propertyName,
          type: type,
        };
      });

      return {
        name,
        fields,
      };
    });

    return {
      database: this.dataSource.options.database,
      datasets: fieldsData,
    };
  }

  @Get('filter-values')
  async getFilterValues(
    @Query('table') table: string,
    @Query('column') column: string,
  ) {
    if (!this.dataSource) {
      return [];
    }

    const allowedTables = ['customer', 'material', 'billing', 'payment'];
    if (!allowedTables.includes(table.toLowerCase())) {
      return [];
    }

    try {
      // Use query builder to handle tenant-specific data
      const results: any[] = await this.dataSource.query(
        `SELECT DISTINCT "${column}" FROM "${table.toLowerCase()}" WHERE "${column}" IS NOT NULL LIMIT 100`
      );
      return results.map((r: any) => r[column]);
    } catch (error) {
      console.error(`Error fetching filter values for ${table}.${column}:`, error);
      return [];
    }
  }
}
