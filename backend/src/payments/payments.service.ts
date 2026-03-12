import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  findAll(): Promise<Payment[]> {
    return this.repo.find({ order: { paidAt: 'DESC' } });
  }

  findOne(id: number): Promise<Payment | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Payment>): Promise<Payment> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Payment>): Promise<Payment | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
