import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { Customer } from './src/customers/customer.entity';
import { Product } from './src/products/product.entity';
import { Billing } from './src/billings/billing.entity';
import { Payment } from './src/payments/payment.entity';
import { Scheme } from './src/schemes/scheme.entity';
import { Recipient } from './src/recipients/recipient.entity';
import { Setting } from './src/settings/setting.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting Database Seeding...');

  // Get Repositories
  const customerRepo = dataSource.getRepository(Customer);
  const productRepo = dataSource.getRepository(Product);
  const billingRepo = dataSource.getRepository(Billing);
  const paymentRepo = dataSource.getRepository(Payment);
  const schemeRepo = dataSource.getRepository(Scheme);
  const recipientRepo = dataSource.getRepository(Recipient);
  const settingRepo = dataSource.getRepository(Setting);

  // 1. Clear existing data
  console.log('🧹 Clearing existing data...');
  await paymentRepo.clear();
  await billingRepo.clear();
  await recipientRepo.clear();
  await schemeRepo.clear();
  await productRepo.clear();
  await customerRepo.clear();
  await settingRepo.clear();

  // 2. Settings
  await settingRepo.save({
    displayName: 'Samishti Admin',
    email: 'admin@samishti.com',
    emailAlerts: true,
    weeklyReports: true,
  });

  // 3. Products
  const products = await productRepo.save([
    { sku: 'FER-001', name: 'Urea 46% N', category: 'Fertilizer', subCategory: 'Nitrogenous', description: 'Standard agricultural urea', unitPrice: 350, unit: '50kg bag', isActive: true },
    { sku: 'FER-002', name: 'DAP 18-46-0', category: 'Fertilizer', subCategory: 'Phosphatic', description: 'Diammonium phosphate', unitPrice: 1200, unit: '50kg bag', isActive: true },
    { sku: 'PES-001', name: 'Chlorpyrifos 20% EC', category: 'Pesticide', subCategory: 'Insecticide', description: 'Broad spectrum insecticide', unitPrice: 450, unit: '1L bottle', isActive: true },
    { sku: 'PES-002', name: 'Glyphosate 41% SL', category: 'Pesticide', subCategory: 'Herbicide', description: 'Systemic non-selective herbicide', unitPrice: 380, unit: '1L bottle', isActive: true },
    { sku: 'SED-001', name: 'Hybrid Cotton Seed (Bt-II)', category: 'Seed', subCategory: 'Cash Crop', description: 'High yield pest resistant cotton', unitPrice: 850, unit: '450g packet', isActive: true },
    { sku: 'SED-002', name: 'Paddy Seed (Swarna)', category: 'Seed', subCategory: 'Cereal', description: 'High yielding paddy variety', unitPrice: 1200, unit: '25kg bag', isActive: true },
  ]);

  // 4. Customers
  const customers = await customerRepo.save([
    { name: 'Ramesh Agro Agency', phone: '9876543210', email: 'ramesh@agro.com', address: 'Market Road, Hubli', region: 'North Karnataka', category: 'A', type: 'Distributor', currentTO: 2500000, avgDaily: 85000, paymentStatus: 'Good', products: 'All' },
    { name: 'Kisan Seva Kendra', phone: '9876543211', email: 'kisan@seva.com', address: 'APMC Yard, Belagavi', region: 'North Karnataka', category: 'B', type: 'Distributor', currentTO: 1200000, avgDaily: 40000, paymentStatus: 'Delayed', products: 'Fertilizers, Seeds' },
    { name: 'Sri Lakshmi Traders', phone: '9876543212', email: 'srilakshmi@traders.com', address: 'Main Bazar, Davangere', region: 'Central Karnataka', category: 'A', type: 'Distributor', currentTO: 3500000, avgDaily: 120000, paymentStatus: 'Excellent', products: 'All' },
    { name: 'Farmer Venkatesh', phone: '9988776655', email: 'venky@farmer.com', address: 'Village X, Haveri', region: 'North Karnataka', category: 'Farmer', type: 'Customer', currentTO: 45000, avgDaily: 0, paymentStatus: 'Good', products: 'Pesticides' },
    { name: 'Farmer Siddappa', phone: '9988776656', email: 'siddu@farmer.com', address: 'Village Y, Gadag', region: 'North Karnataka', category: 'Farmer', type: 'Customer', currentTO: 120000, avgDaily: 0, paymentStatus: 'Good', products: 'Seeds, Fertilizers' },
  ]);

  // 5. Billings (Invoices)
  const billings = await billingRepo.save([
    { invoiceNo: 'INV-2026-001', customerId: customers[0].id, amount: 150000, status: 'Paid', billingDate: '2026-03-01', dueDate: '2026-03-15' },
    { invoiceNo: 'INV-2026-002', customerId: customers[0].id, amount: 200000, status: 'Unpaid', billingDate: '2026-03-04', dueDate: '2026-03-18' },
    { invoiceNo: 'INV-2026-003', customerId: customers[1].id, amount: 85000, status: 'Unpaid', billingDate: '2026-02-28', dueDate: '2026-03-14' },
    { invoiceNo: 'INV-2026-004', customerId: customers[2].id, amount: 500000, status: 'Paid', billingDate: '2026-03-02', dueDate: '2026-03-16' },
  ]);

  // 6. Payments
  await paymentRepo.save([
    { customerId: customers[0].id, amount: 150000, mode: 'Bank Transfer', status: 'Completed', paidAt: new Date('2026-03-05T10:00:00Z') },
    { customerId: customers[2].id, amount: 500000, mode: 'RTGS', status: 'Completed', paidAt: new Date('2026-03-03T14:30:00Z') },
  ]);

  // 7. Schemes
  const schemes = await schemeRepo.save([
    { name: 'Monsoon Fertilizer Dhamaka', description: 'Buy 100 bags of DAP, get 5 bags Urea free', startDate: '2026-06-01', endDate: '2026-07-31', targetType: 'product_qty', totalBudget: 500000, individualTarget: 100, rewardRate: 5, recipientType: 'distributor', regionFilter: 'North Karnataka', status: 'upcoming' },
    { name: 'Pesticide Early Bird', description: '2% extra discount on early cash payments for pesticides', startDate: '2026-03-01', endDate: '2026-04-30', targetType: 'total_sales', totalBudget: 200000, individualTarget: 50000, rewardRate: 2, recipientType: 'distributor', regionFilter: 'all', status: 'active' },
    { name: 'Cotton Seed Bonanza', description: 'Farmer scheme: Buy 10 packets cotton seed, get 1L Glyphosate free', startDate: '2026-05-01', endDate: '2026-06-15', targetType: 'category_qty', totalBudget: 100000, individualTarget: 10, rewardRate: 1, recipientType: 'customer', regionFilter: 'all', status: 'upcoming' },
  ]);

  // 8. Recipients (Link customers to schemes)
  await recipientRepo.save([
    { name: customers[0].name, recipientType: 'distributor', region: customers[0].region, category: customers[0].category, products: ['Fertilizers'], currentTO: 2500000, avgDaily: 85000, paymentStatus: 'Completed', type: 'Dealer' },
    { name: customers[1].name, recipientType: 'distributor', region: customers[1].region, category: customers[1].category, products: ['Fertilizers'], currentTO: 1200000, avgDaily: 40000, paymentStatus: 'Pending', type: 'Dealer' },
    { name: customers[2].name, recipientType: 'distributor', region: customers[2].region, category: customers[2].category, products: ['Pesticides'], currentTO: 3500000, avgDaily: 120000, paymentStatus: 'Completed', type: 'Dealer' },
    { name: customers[3].name, recipientType: 'customer', region: customers[3].region, category: customers[3].category, products: ['Seeds'], currentTO: 45000, avgDaily: 0, paymentStatus: 'Completed', type: 'Retailer' },
  ]);

  console.log('✅ Database Seeding Complete!');
  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
