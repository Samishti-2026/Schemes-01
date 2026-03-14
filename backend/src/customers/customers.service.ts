import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  private get repository(): Repository<Customer> {
    return this.dataSource.getRepository(Customer);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(customer_code: number) {
    return this.repository.findOne({ where: { customer_code } });
  }

  create(data: Partial<Customer>) {
    const customer = this.repository.create(data);
    return this.repository.save(customer);
  }
}
