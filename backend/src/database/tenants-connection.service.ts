import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Scheme } from '../schemes/scheme.entity';
import { SchemeConfig } from '../scheme-configs/scheme-config.entity';
import { Customer } from '../entities/customer.entity';
import { Material } from '../entities/material.entity';
import { Billing } from '../entities/billing.entity';
import { Payment } from '../entities/payment.entity';
import { Client } from 'pg';

@Injectable()
export class TenantsConnectionService implements OnModuleDestroy {
  private connections: Map<string, DataSource> = new Map();

  constructor(private configService: ConfigService) {}

  async getTenantConnection(tenantId: string, dbName: string): Promise<DataSource> {
    if (this.connections.has(tenantId)) {
      const connection = this.connections.get(tenantId);
      if (!connection) {
        throw new Error(`Connection for tenant ${tenantId} not found`);
      }
      return connection.isInitialized ? connection : connection.initialize();
    }

    // Use provided dbName or fall back to default naming convention
    const activeDbName = dbName || `tenant_${tenantId}`;

    // Ensure database exists
    await this.ensureDatabaseExists(activeDbName);

    console.log(`Creating new connection for tenant ${tenantId} using database: ${activeDbName}`);

    const options: DataSourceOptions = {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: activeDbName,
      entities: [Scheme, SchemeConfig, Customer, Material, Billing, Payment],
      synchronize: true, // Auto-create tables in tenant DBs for dev
    };

    const dataSource = new DataSource(options);
    await dataSource.initialize();
    this.connections.set(tenantId, dataSource);
    return dataSource;
  }

  private async ensureDatabaseExists(dbName: string) {
    const client = new Client({
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      user: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: 'postgres', // Connect to default postgres DB to create others
    });

    try {
      await client.connect();
      const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
      if (res.rowCount === 0) {
        // Create database if it doesn't exist
        await client.query(`CREATE DATABASE "${dbName}"`);
        console.log(`Database ${dbName} created successfully.`);
      }
    } catch (err) {
      console.error(`Error ensuring database ${dbName} exists:`, err.message);
    } finally {
      await client.end();
    }
  }

  async onModuleDestroy() {
    for (const connection of this.connections.values()) {
      if (connection.isInitialized) {
        await connection.destroy();
      }
    }
  }
}
// Force restart
