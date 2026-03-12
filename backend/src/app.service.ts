import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getFilterValues(table: string, column: string): Promise<string[]> {
    if (!table || !column) {
      throw new BadRequestException('Table and column are required');
    }

    // Basic sanitization: only allow alphanumeric and underscores
    const alphaNumRegex = /^[a-zA-Z0-9_]+$/;
    if (!alphaNumRegex.test(table)) throw new BadRequestException('Invalid table name');
    // Allow dots in column names (though typically not needed for raw distinct queries on a specific table)
    if (!/^[a-zA-Z0-9_]+$/.test(column)) throw new BadRequestException('Invalid column name');

    // SQLite doesn't use standard quotes for tables in the same way, but it accepts double quotes or brackets.
    try {
      // Use raw SQL to get distinct values. We limit to 100 to prevent huge payloads for things like names.
      // In SQLite, table names might be lowercase or pluralized in TypeORM. 
      // Ensure we query the right table string. We might need to handle TypeORM entity names vs DB table names.
      // E.g., 'Product' -> 'products', 'Customer' -> 'customers'
      const tableName = table.toLowerCase().endsWith('s') ? table.toLowerCase() : table.toLowerCase() + 's';

      let selectClause = `"${column}"`;
      if (column.toLowerCase().includes('date') || column.toLowerCase().endsWith('at')) {
        selectClause = `CAST("${column}" AS DATE)`;
      }

      const query = `
        SELECT DISTINCT ${selectClause} as value 
        FROM "${tableName}" 
        WHERE "${column}" IS NOT NULL
        LIMIT 100
      `;

      const results = await this.dataSource.query(query);
      return results.map((row: any) => row.value);
    } catch (err) {
      console.error('Error fetching filter values:', err);
      return [];
    }
  }
}
