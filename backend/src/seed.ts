import { DataSource } from 'typeorm';
import { Scheme } from './schemes/scheme.entity';
import { Recipient } from './recipients/recipient.entity';
import { Setting } from './settings/setting.entity';
import { Billing } from './billings/billing.entity';
import { Payment } from './payments/payment.entity';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'samishti_schemes',
  entities: [Scheme, Recipient, Setting, Billing, Payment],
  synchronize: true,
});

async function seed() {
  console.log('🌱 Connecting to database...');
  await AppDataSource.initialize();
  console.log('✅ Connected!');

  const schemeRepo = AppDataSource.getRepository(Scheme);
  const recipientRepo = AppDataSource.getRepository(Recipient);
  const settingRepo = AppDataSource.getRepository(Setting);
  const billingRepo = AppDataSource.getRepository(Billing);
  const paymentRepo = AppDataSource.getRepository(Payment);

  // Clear existing data
  await schemeRepo.query('DELETE FROM schemes');
  await recipientRepo.query('DELETE FROM recipients');
  await settingRepo.query('DELETE FROM settings');
  await billingRepo.query('DELETE FROM billings');
  await paymentRepo.query('DELETE FROM payments');

  // ═══════════════════════════════════════════════
  // SCHEMES — 10 diverse schemes across statuses
  // ═══════════════════════════════════════════════
  console.log('📋 Seeding schemes...');
  const schemes = schemeRepo.create([
    // --- ACTIVE SCHEMES (3) ---
    {
      name: 'Diwali Bonanza 2026',
      description:
        'Festival mega-push: Dealers selling ₹50K+ in Diwali quarter get 5% cashback',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      status: 'active',
      targetType: 'TOTAL SALES',
      totalBudget: 120000,
      maxQualifiers: 120,
      payoutType: 'Fixed Amount',
      payoutAmount: 5000,
      payoutPerPerson: 2500,
      recipientType: 'customer',
      regionFilter: 'all',
      region: 'All Regions',
      category: 'All',
      targets: 87,
      revenue: '₹45L',
    },
    {
      name: 'Insecticide Push Q1',
      description:
        'Drive adoption of XYZ Insecticide 1L among north zone retailers',
      startDate: '2026-01-15',
      endDate: '2026-04-15',
      status: 'active',
      targetType: 'PRODUCT QTY',
      selectedTargetItem: 'XYZ Insecticide 1L',
      totalBudget: 80000,
      maxQualifiers: 60,
      payoutType: 'Fixed Amount',
      payoutAmount: 5000,
      payoutPerPerson: 500,
      recipientType: 'customer',
      regionFilter: 'north',
      region: 'North',
      category: 'Insecticides',
      targets: 42,
      revenue: '₹18L',
    },
    {
      name: 'Distributor Loyalty Program',
      description:
        'Quarterly loyalty bonus for top-performing distributors across all regions',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      status: 'active',
      targetType: 'TOTAL SALES',
      totalBudget: 500000,
      maxQualifiers: 25,
      payoutType: 'Fixed Amount',
      payoutAmount: 5000,
      payoutPerPerson: 15000,
      recipientType: 'distributor',
      regionFilter: 'all',
      region: 'All Regions',
      category: 'All',
      targets: 8,
      revenue: '₹1.2Cr',
    },

    // --- EXPIRED SCHEMES (3) ---
    {
      name: 'Summer Sale 2025',
      description: 'Summer clearance for insecticides — West zone exclusive',
      startDate: '2025-04-01',
      endDate: '2025-06-30',
      status: 'expired',
      targetType: 'PRODUCT QTY',
      selectedTargetItem: 'XYZ Insecticide 1L',
      totalBudget: 50000,
      maxQualifiers: 85,
      payoutType: 'Fixed Amount',
      payoutAmount: 5000,
      payoutPerPerson: 900,
      recipientType: 'customer',
      regionFilter: 'west',
      region: 'West',
      category: 'Insecticides',
      targets: 85,
      revenue: '₹32L',
    },
    {
      name: 'Kharif Season Special',
      description: 'Herbicide volume push during Kharif planting season',
      startDate: '2025-06-01',
      endDate: '2025-09-30',
      status: 'expired',
      targetType: 'CATEGORY QTY',
      selectedTargetItem: 'Herbicides Group',
      totalBudget: 175000,
      maxQualifiers: 100,
      payoutType: 'Fixed Amount',
      payoutAmount: 5000,
      payoutPerPerson: 1600,
      recipientType: 'customer',
      regionFilter: 'all',
      region: 'All Regions',
      category: 'Herbicides',
      targets: 92,
      revenue: '₹68L',
    },
    {
      name: 'Advance Payment Reward Q4-2025',
      description: 'Early payment bonus for advance payment before delivery',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      status: 'expired',
      targetType: 'ADV PAYMENT',
      totalBudget: 60000,
      maxQualifiers: 50,
      payoutType: 'Fixed Amount',
      payoutAmount: 5000,
      payoutPerPerson: 2000,
      recipientType: 'customer',
      regionFilter: 'south',
      region: 'South',
      category: 'All',
      targets: 38,
      revenue: '₹52L',
    },

    // --- UPCOMING SCHEMES (4) ---
    {
      name: 'Monsoon Dhamaka 2026',
      description: 'Monsoon season special for herbicides — all distributors',
      startDate: '2026-06-01',
      endDate: '2026-09-30',
      status: 'upcoming',
      targetType: 'PRODUCT QTY',
      selectedTargetItem: 'ABC Herbicide 500ml',
      totalBudget: 150000,
      maxQualifiers: 150,
      payoutType: 'Fixed Amount',
      payoutAmount: 5000,
      payoutPerPerson: 2400,
      recipientType: 'distributor',
      regionFilter: 'all',
      region: 'All Regions',
      category: 'Herbicides',
      targets: 0,
      revenue: '-',
    },
    {
      name: 'Year End Rush 2026',
      description: 'Year-end target push for fertilizers category — South zone',
      startDate: '2026-10-01',
      endDate: '2026-12-31',
      status: 'upcoming',
      targetType: 'CATEGORY QTY',
      selectedTargetItem: 'Fertilizers Group',
      totalBudget: 200000,
      maxQualifiers: 200,
      payoutType: 'Fixed Amount',
      payoutAmount: 5000,
      payoutPerPerson: 5250,
      recipientType: 'customer',
      regionFilter: 'south',
      region: 'South',
      category: 'Fertilizers',
      targets: 0,
      revenue: '-',
    },
    {
      name: 'New Year Blast 2027',
      description:
        'New year celebration — mega cashback for all qualifying customers',
      startDate: '2027-01-01',
      endDate: '2027-03-31',
      status: 'upcoming',
      targetType: 'TOTAL SALES',
      totalBudget: 300000,
      maxQualifiers: 250,
      payoutType: 'Fixed Amount',
      payoutAmount: 5000,
      payoutPerPerson: 8000,
      recipientType: 'customer',
      regionFilter: 'all',
      region: 'All Regions',
      category: 'All',
      targets: 0,
      revenue: '-',
    },
    {
      name: 'Rabi Season Fungicide Drive',
      description:
        'Push fungicide adoption during Rabi crop season — East & North',
      startDate: '2026-11-01',
      endDate: '2027-02-28',
      status: 'upcoming',
      targetType: 'PRODUCT QTY',
      selectedTargetItem: 'DEF Fungicide 250g',
      totalBudget: 90000,
      maxQualifiers: 80,
      payoutType: 'Fixed Amount',
      payoutAmount: 5000,
      payoutPerPerson: 750,
      recipientType: 'customer',
      regionFilter: 'east',
      region: 'East',
      category: 'Fungicides',
      targets: 0,
      revenue: '-',
    },
  ]);
  await schemeRepo.save(schemes);
  console.log(`  ✅ ${schemes.length} schemes created`);

  // ═══════════════════════════════════════════════
  // RECIPIENTS — Generate 150 diverse recipients
  // ═══════════════════════════════════════════════
  console.log('👥 Seeding recipients...');

  const regions = ['North', 'South', 'East', 'West'];
  const categories = ['Insecticides', 'Fertilizers', 'Herbicides', 'Seeds', 'Fungicides'];
  const productsList = [
    'XYZ Insecticide 1L', 'PQR Insecticide 500ml', 'DAP 50kg', 'Urea 45kg',
    'ABC Herbicide 500ml', 'Glyphosate 1L', 'Hybrid Corn Seeds', 'Paddy Seeds',
    'DEF Fungicide 250g', 'Mancozeb 500g', 'NPK Complex', 'Zinc Sulphate',
  ];

  const generatedRecipients = [];

  // Generate 120 Customers (Dealers/Retailers)
  for (let i = 0; i < 120; i++) {
    const isDealer = faker.datatype.boolean();
    // Broaden customer range from 50k to 80 Lakhs so some easily cross 50L mark
    const currentTO = faker.number.int({ min: 500000, max: 8000000 });

    const paymentStatus = faker.helpers.arrayElement(['Completed', 'Completed', 'Completed', 'Pending', 'Failed']); // higher chance of completed
    const invoiceDate = faker.date.recent({ days: 90 });
    let paymentDateStr: string | undefined = undefined;
    if (paymentStatus === 'Completed') {
      // Create a payment date that is between 5 and 45 days after the invoice. This ensures a good chunk fall under 30 days.
      const daysToAdd = faker.number.int({ min: 5, max: 45 });
      const payDate = new Date(invoiceDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      // Ensure payment date is not in the future
      paymentDateStr = payDate > new Date() ? new Date().toISOString() : payDate.toISOString();
    }

    generatedRecipients.push({
      name: `${faker.company.name()} ${isDealer ? 'Agro' : 'Retail'}`,
      currentTO,
      avgDaily: Math.floor(currentTO / 30),
      category: faker.helpers.arrayElement(categories),
      type: isDealer ? 'Dealer' : 'Retailer',
      region: faker.helpers.arrayElement(regions),
      paymentStatus,
      invoiceDate: invoiceDate.toISOString(),
      paymentDate: paymentDateStr,
      products: faker.helpers.arrayElements(productsList, { min: 1, max: 4 }),
      recipientType: 'customer',
    });
  }

  // Generate 25 Distributors
  for (let i = 0; i < 25; i++) {
    // Boost distributors from 15 Lakhs to 2.5 Crores
    const currentTO = faker.number.int({ min: 1500000, max: 25000000 });

    const paymentStatus = faker.helpers.arrayElement(['Completed', 'Completed', 'Pending']);
    const invoiceDate = faker.date.recent({ days: 60 });
    let paymentDateStr: string | undefined = undefined;
    if (paymentStatus === 'Completed') {
      const daysToAdd = faker.number.int({ min: 3, max: 40 });
      const payDate = new Date(invoiceDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      paymentDateStr = payDate > new Date() ? new Date().toISOString() : payDate.toISOString();
    }

    generatedRecipients.push({
      name: `${faker.location.city()} Distributors`,
      currentTO,
      avgDaily: Math.floor(currentTO / 30),
      category: 'All',
      type: 'Distributor',
      region: faker.helpers.arrayElement(regions),
      paymentStatus,
      invoiceDate: invoiceDate.toISOString(),
      paymentDate: paymentDateStr,
      products: ['All Products'],
      recipientType: 'distributor',
    });
  }

  // Generate 10 Sales Executives
  for (let i = 0; i < 10; i++) {
    // Boost sales execs from 10 Lakhs to 80 Lakhs
    const currentTO = faker.number.int({ min: 1000000, max: 8000000 });

    const invoiceDate = faker.date.recent({ days: 30 }).toISOString();
    const paymentDate = faker.date.between({ from: invoiceDate, to: new Date() }).toISOString();

    generatedRecipients.push({
      name: `${faker.person.fullName()} — ${faker.helpers.arrayElement(['Area Mgr', 'Zonal Head', 'Territory Mgr'])}`,
      currentTO,
      avgDaily: Math.floor(currentTO / 30),
      category: 'All',
      type: 'Sales Executive',
      region: faker.helpers.arrayElement(regions),
      paymentStatus: 'Completed',
      invoiceDate,
      paymentDate,
      products: [`Territory: ${faker.location.state()}`],
      recipientType: 'sales executive',
    });
  }

  const recipients = recipientRepo.create(generatedRecipients);
  const savedRecipients = await recipientRepo.save(recipients);
  console.log(`  ✅ ${recipients.length} recipients created`);

  // Generate Billings and Payments based on recipients
  console.log('💰 Seeding billings & payments...');
  const generatedBillings = [];
  const generatedPayments = [];

  for (const r of savedRecipients) {
    // Generate 1-3 random bills per recipient
    const numBills = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < numBills; j++) {
      const bAmount = faker.number.int({ min: 10000, max: 500000 });
      let bDate = new Date(r.invoiceDate);
      if (j > 0) {
        // Offset other bills slightly
        bDate = new Date(bDate.getTime() - faker.number.int({ min: 5, max: 90 }) * 86400000);
      }

      const billing = billingRepo.create({
        invoiceNo: `INV-${faker.string.alphanumeric(6).toUpperCase()}`,
        customerId: r.id, // Using recipient ID since they act as customers
        amount: bAmount,
        status: faker.helpers.arrayElement(['Paid', 'Overdue', 'Pending']),
        billingDate: bDate.toISOString().split('T')[0],
        dueDate: new Date(bDate.getTime() + 30 * 86400000).toISOString().split('T')[0],
      });
      generatedBillings.push(billing);

      // Randomly link a payment or two if status isn't pending
      if (billing.status === 'Paid') {
        let pDateStr = r.paymentDate;
        if (!pDateStr) {
          // Fallback if recipient didn't have paymentDate
          pDateStr = new Date(bDate.getTime() + faker.number.int({ min: 5, max: 40 }) * 86400000).toISOString();
        }

        generatedPayments.push(paymentRepo.create({
          customerId: r.id,
          amount: bAmount, // Paying full amount
          mode: faker.helpers.arrayElement(['NEFT', 'RTGS', 'UPI', 'Cheque']),
          status: 'Success',
          paidAt: new Date(pDateStr),
        }));
      }
    }
  }

  await billingRepo.save(generatedBillings);
  await paymentRepo.save(generatedPayments);
  console.log(`  ✅ ${generatedBillings.length} billings created`);
  console.log(`  ✅ ${generatedPayments.length} payments created`);

  // ═══════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════
  console.log('⚙️  Seeding settings...');
  const settings = settingRepo.create({
    displayName: 'Executive',
    email: 'executive@samishti.com',
    emailAlerts: true,
    weeklyReports: true,
    systemUpdates: true,
  });
  await settingRepo.save(settings);
  console.log('  ✅ Settings created');

  // Print summary
  console.log('\n' + '═'.repeat(50));
  console.log('🎉 SEED COMPLETE — Summary:');
  console.log('═'.repeat(50));
  console.log(
    `  📋 Schemes:     ${schemes.length} (3 Active, 3 Expired, 4 Upcoming)`,
  );
  console.log(
    `  👥 Recipients:  ${recipients.length} (120 Customers, 25 Distributors, 10 Sales Execs)`,
  );
  console.log(`  💰 Billings:    ${generatedBillings.length}`);
  console.log(`  💸 Payments:    ${generatedPayments.length}`);
  console.log(`  ⚙️  Settings:    1`);
  console.log('═'.repeat(50));

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
