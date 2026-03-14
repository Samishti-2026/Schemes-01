import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BillingsService } from './billings.service';
import { Billing } from '../entities/billing.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('billings')
@Controller('billings')
export class BillingsController {
  constructor(private readonly service: BillingsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<Billing>) {
    return this.service.create(data);
  }
}
