const { Client } = require('pg');
require('dotenv').config();

async function createDB() {
  // Connect to the default 'postgres' database to issue the CREATE DATABASE command
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: 'postgres', // Must connect to an existing DB first
  });

  try {
    await client.connect();
    console.log('Connected to default postgres instance.');

    // Check if database exists
    const res = await client.query(`SELECT datname FROM pg_database WHERE datname = 'Schemes_DB'`);
    if (res.rowCount === 0) {
      console.log('Creating database Schemes_DB...');
      await client.query('CREATE DATABASE "Schemes_DB"');
      console.log('✅ Database Schemes_DB created successfully.');
    } else {
      console.log('✅ Database Schemes_DB already exists.');
    }

  } catch (err) {
    console.error('❌ Error creating database:', err);
  } finally {
    await client.end();
  }
}

createDB();
