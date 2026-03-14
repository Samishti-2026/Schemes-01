import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  private get repository(): Repository<Payment> {
    return this.dataSource.getRepository(Payment);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(company_code: number, bill_doc: number, customer_number: number, accounting_document: number, item_num: number) {
    return this.repository.findOne({ where: { company_code, bill_doc, customer_number, accounting_document, item_num } });
  }

  create(data: Partial<Payment>) {
    const payment = this.repository.create(data);
    return this.repository.save(payment);
  }
}
