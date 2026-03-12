import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemeConfig } from './scheme-config.entity';
import { SchemeConfigService } from './scheme-config.service';
import { SchemeConfigController } from './scheme-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SchemeConfig])],
  controllers: [SchemeConfigController],
  providers: [SchemeConfigService],
  exports: [SchemeConfigService],
})
export class SchemeConfigModule {}
