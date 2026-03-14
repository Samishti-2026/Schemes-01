import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function listTenants() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '0807',
    database: 'Common_DB',
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM tenant');
    console.log('Current Tenants in Common_DB:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

listTenants();
