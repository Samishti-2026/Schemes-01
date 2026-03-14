import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingsController } from './billings.controller';
import { BillingsService } from './billings.service';
import { Billing } from '../entities/billing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Billing])],
  controllers: [BillingsController],
  providers: [BillingsService],
  exports: [BillingsService],
})
export class BillingsModule {}
