import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BillingsService } from './billings.service';
import { Billing } from './billing.entity';

@ApiTags('Billings')
@Controller('api/billings')
export class BillingsController {
  constructor(private readonly service: BillingsService) { }

  @Get()
  findAll(): Promise<Billing[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Billing | null> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<Billing>): Promise<Billing> {
    return this.service.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Billing>,
  ): Promise<Billing | null> {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(+id);
  }
}
