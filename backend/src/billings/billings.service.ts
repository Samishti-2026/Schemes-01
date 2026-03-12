import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billing } from './billing.entity';

@Injectable()
export class BillingsService {
  constructor(
    @InjectRepository(Billing)
    private readonly repo: Repository<Billing>,
  ) {}

  findAll(): Promise<Billing[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: number): Promise<Billing | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Billing>): Promise<Billing> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Billing>): Promise<Billing | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
