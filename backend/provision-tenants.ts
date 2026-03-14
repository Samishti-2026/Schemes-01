import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { TenantsService } from './src/tenants/tenants.service';
import { TenantsConnectionService } from './src/database/tenants-connection.service';

async function provisionAll() {
  console.log('Starting tenant-wide schema provisioning...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // We can't easily get request-scoped services from the root context,
  // but we can get the singleton TenantsConnectionService.
  const connectionService = app.get(TenantsConnectionService);
  
  // We need all tenants. TenantsService is request-scoped, so we use raw DB or 
  // temporary service injection if we can.
  // Let's use a simpler approach: raw pg to get names, then connectionService.
  const { Client } = await import('pg');
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '0807',
    database: 'Common_DB',
  });

  try {
    await client.connect();
    const res = await client.query('SELECT id, dbname FROM tenant');
    const tenants = res.rows;

    for (const tenant of tenants) {
      if (tenant.dbname) {
        console.log(`Provisioning database: ${tenant.dbname} (Tenant ID: ${tenant.id})...`);
        try {
          const ds = await connectionService.getTenantConnection(String(tenant.id), tenant.dbname);
          console.log(`Successfully provisioned/synchronized ${tenant.dbname}`);
          // Close connection to avoid leaks if we are doing many
          // wait, connectionService caches them.
        } catch (err) {
          console.error(`Failed to provision ${tenant.dbname}:`, err.message);
        }
      }
    }
    console.log('Provisioning complete.');
  } catch (err) {
    console.error('Provisioning error:', err.message);
  } finally {
    await client.end();
    await app.close();
  }
}

provisionAll();
