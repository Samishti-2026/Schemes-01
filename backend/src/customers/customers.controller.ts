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
import { CustomersService } from './customers.service';
import { Customer } from './customer.entity';

@ApiTags('Customers')
@Controller('api/customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) { }

  @Get()
  findAll(): Promise<Customer[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Customer | null> {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<Customer>): Promise<Customer> {
    return this.service.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Customer>,
  ): Promise<Customer | null> {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(+id);
  }
}
