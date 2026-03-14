import { Controller, Get, Query, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';

@Controller('recipients')
export class RecipientsController {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  private get customerRepo(): Repository<Customer> {
    return this.dataSource.getRepository(Customer);
  }

  @Get()
  async findAll(@Query('recipientType') recipientType: string) {
    if (recipientType === 'customer') {
      const customers = await this.customerRepo.find();
      // Map SAP-style Customer to frontend Recipient type
      return customers.map(c => {
        // Map SAP-style Customer to frontend Recipient type
        const { ...rest } = c;
        return {
          ...rest,
          id: c.customer_code,
          name: c.customer_name,
          // Mocking some fields that aren't in the DB yet but expected by frontend
          currentTO: Math.floor(Math.random() * 5000000), // Placeholder logic
          avgDaily: Math.floor(Math.random() * 50000),    // Placeholder logic
        };
      });
    }
    return [];
  }

  @Get('filter-options')
  async getFilterOptions() {
    // This is another endpoint the frontend calls
    return [
      {
        name: 'Customer',
        options: ['customer_name', 'country', 'region', 'customer_group'],
      }
    ];
  }
}
