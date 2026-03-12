import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Scheme } from '../schemes/scheme.entity';
import { Recipient } from '../recipients/recipient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scheme, Recipient])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
