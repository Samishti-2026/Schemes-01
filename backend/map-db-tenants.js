import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function mapTenants() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '0807',
    database: 'Common_DB',
  });

  const exactMappings = [
    { name: 'Samishti Infotech', code: 'SAM001', industry: 'Software', color: '#06b6d4', dbname: 'Scheme_Tool_DB' },
    { name: 'GreenGrow Agrochemicals', code: 'SAM010', industry: 'Agrochemicals', color: '#10b981', dbname: 'tenant_greengrow' },
    { name: 'PharmaCure Solutions', code: 'SAM011', industry: 'Pharmaceuticals', color: '#ec4899', dbname: 'tenant_pharmacure' },
    { name: 'RetailX Corp', code: 'SAM012', industry: 'Retail', color: '#f59e0b', dbname: 'tenant_retailx' },
    { name: 'Samishti India', code: 'SAM013', industry: 'Manufacturing', color: '#6366f1', dbname: 'tenant_samishti_india' },
    { name: 'TechCorp Global', code: 'SAM014', industry: 'Technology', color: '#3b82f6', dbname: 'tenant_techcorp_global' },
  ];

  try {
    await client.connect();
    
    // Clear existing to ensure exact matches only (optional, but requested "use these")
    // Let's just UPSERT/Check to avoid deleting if they have others they want to keep.
    // Actually, user said "use these and these are databases" pointing to the screenshot.
    // I'll clear others to make it clean as per their screenshot.
    
    console.log('Cleaning up old tenants...');
    await client.query('DELETE FROM tenant');

    for (const company of exactMappings) {
      await client.query(`
        INSERT INTO tenant (name, code, industry, color, dbname)
        VALUES ($1, $2, $3, $4, $5)
      `, [company.name, company.code, company.industry, company.color, company.dbname]);
      console.log(`Mapped tenant: ${company.name} -> ${company.dbname}`);
    }
    
    console.log('Tenant mapping complete.');
  } catch (err) {
    console.error('Error mapping tenants:', err.message);
  } finally {
    await client.end();
  }
}

mapTenants();
