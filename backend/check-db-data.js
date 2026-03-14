import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkData() {
  const commonConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '0807',
  };

  const databases = [
    'Scheme_Tool_DB',
    'tenant_greengrow',
    'tenant_pharmacure',
    'tenant_retailx',
    'tenant_samishti_india',
    'tenant_techcorp_global'
  ];

  for (const db of databases) {
     const client = new Client({ ...commonConfig, database: db });
     try {
       await client.connect();
       const res = await client.query('SELECT count(*) FROM customer');
       console.log(`Database ${db}: ${res.rows[0].count} customers`);
     } catch (err) {
       console.log(`Database ${db}: Error - ${err.message}`);
     } finally {
       await client.end();
     }
  }
}

checkData();
