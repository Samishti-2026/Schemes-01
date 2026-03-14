import { Module } from '@nestjs/common';
import { SchemeConfigsController } from './scheme-configs.controller';
import { SchemeConfigsService } from './scheme-configs.service';

@Module({
  controllers: [SchemeConfigsController],
  providers: [SchemeConfigsService],
  exports: [SchemeConfigsService],
})
export class SchemeConfigsModule {}
