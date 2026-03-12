const { Client } = require('pg');
require('dotenv').config();

async function dropTables() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'samishti_schemes',
  });

  try {
    await client.connect();
    console.log('Connected to DB. Dropping schemas...');
    await client.query('DROP TABLE IF EXISTS schemes CASCADE;');
    await client.query('DROP TABLE IF EXISTS recipients CASCADE;');
    await client.query('DROP TABLE IF EXISTS settings CASCADE;');
    console.log('Tables dropped successfully.');
  } catch (err) {
    console.error('Error dropping tables:', err);
  } finally {
    await client.end();
  }
}

dropTables();
