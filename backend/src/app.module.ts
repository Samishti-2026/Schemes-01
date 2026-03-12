import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchemesModule } from './schemes/schemes.module';
import { RecipientsModule } from './recipients/recipients.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SettingsModule } from './settings/settings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SchemeConfigModule } from './scheme-config/scheme-config.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { BillingsModule } from './billings/billings.module';
import { PaymentsModule } from './payments/payments.module';
import { DatasetsModule } from './datasets/datasets.module'; // ← added
import { Scheme } from './schemes/scheme.entity';
import { Recipient } from './recipients/recipient.entity';
import { Setting } from './settings/setting.entity';
import { SchemeConfig } from './scheme-config/scheme-config.entity';
import { Customer } from './customers/customer.entity';
import { Product } from './products/product.entity';
import { Billing } from './billings/billing.entity';
import { Payment } from './payments/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'samishti_schemes',
      entities: [
        Scheme,
        Recipient,
        Setting,
        SchemeConfig,
        Customer,
        Product,
        Billing,
        Payment,
      ],
      synchronize: true,
    }),
    SchemesModule,
    RecipientsModule,
    AnalyticsModule,
    SettingsModule,
    DashboardModule,
    SchemeConfigModule,
    CustomersModule,
    ProductsModule,
    BillingsModule,
    PaymentsModule,
    DatasetsModule, // ← added
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }