import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from '../entities/payment.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('find')
  findOne(
    @Query('company_code') company_code: string,
    @Query('bill_doc') bill_doc: string,
    @Query('customer_number') customer_number: string,
    @Query('accounting_document') accounting_document: string,
    @Query('item_num') item_num: string,
  ) {
    return this.service.findOne(+company_code, +bill_doc, +customer_number, +accounting_document, +item_num);
  }

  @Post()
  create(@Body() data: Partial<Payment>) {
    return this.service.create(data);
  }
}
