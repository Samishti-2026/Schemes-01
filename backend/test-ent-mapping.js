import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { TenantsService } from './src/tenants/tenants.service';

async function testTenants() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const tenantsService = app.get(TenantsService);

  // We need to mock the request context if we were calling it through DI, 
  // but we can call it directly since it's just a service.
  // Wait, TenantsService is Scope.REQUEST. We can't get it easily from app.get.
  
  console.log('Testing TenantsService...');
  // I'll use a raw repository test instead.
  const { DataSource } = await import('typeorm');
  const ds = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '0807',
    database: 'Common_DB',
    entities: [__dirname + '/src/tenants/tenant.entity.ts'],
  });
  
  await ds.initialize();
  const repo = ds.getRepository('Tenant');
  const tenants = await repo.find();
  console.log('All Tenants:', JSON.stringify(tenants, null, 2));
  
  await ds.destroy();
  await app.close();
}

testTenants();
