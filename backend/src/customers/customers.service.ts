import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  findAll(): Promise<Customer[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: number): Promise<Customer | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Customer>): Promise<Customer> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Customer>): Promise<Customer | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
