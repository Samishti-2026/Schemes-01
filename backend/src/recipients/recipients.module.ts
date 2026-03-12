import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipientsController } from './recipients.controller';
import { RecipientsService } from './recipients.service';
import { Recipient } from './recipient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipient])],
  controllers: [RecipientsController],
  providers: [RecipientsService],
  exports: [RecipientsService],
})
export class RecipientsModule {}
