import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Scheme } from '../schemes/scheme.entity';
import { Recipient } from '../recipients/recipient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scheme, Recipient])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
