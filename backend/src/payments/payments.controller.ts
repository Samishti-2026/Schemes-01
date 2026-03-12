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
import { PaymentsService } from './payments.service';
import { Payment } from './payment.entity';

@ApiTags('Payments')
@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) { }

  @Get()
  findAll(): Promise<Payment[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Payment | null> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<Payment>): Promise<Payment> {
    return this.service.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Payment>,
  ): Promise<Payment | null> {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(+id);
  }
}
