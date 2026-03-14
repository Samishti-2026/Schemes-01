import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Billing } from '../entities/billing.entity';

@Injectable()
export class BillingsService {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  private get repository(): Repository<Billing> {
    return this.dataSource.getRepository(Billing);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(billing_doc: number) {
    return this.repository.findOne({ where: { billing_doc } });
  }

  create(data: Partial<Billing>) {
    const billing = this.repository.create(data);
    return this.repository.save(billing);
  }
}
