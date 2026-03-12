import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'samishti_schemes',
});

async function run() {
  await AppDataSource.initialize();
  const res = await AppDataSource.query('SELECT "paidAt" FROM payments LIMIT 5');
  console.log(res);
  await AppDataSource.destroy();
}
run();
