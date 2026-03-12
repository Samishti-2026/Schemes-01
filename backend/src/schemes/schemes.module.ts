import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemesController } from './schemes.controller';
import { SchemesService } from './schemes.service';
import { Scheme } from './scheme.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scheme])],
  controllers: [SchemesController],
  providers: [SchemesService],
  exports: [SchemesService],
})
export class SchemesModule {}
