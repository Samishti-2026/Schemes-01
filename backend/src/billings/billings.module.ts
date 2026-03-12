import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Billing } from './billing.entity';
import { BillingsService } from './billings.service';
import { BillingsController } from './billings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Billing])],
  controllers: [BillingsController],
  providers: [BillingsService],
  exports: [BillingsService],
})
export class BillingsModule {}
