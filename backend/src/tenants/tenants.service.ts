import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';

@Injectable({ scope: Scope.REQUEST })
export class TenantsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Tenant)
    private readonly repository: Repository<Tenant>,
  ) { }

  getTenantId(): string {
    const tenantId = this.request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      return 'default';
    }
    return tenantId;
  }

  findAll() {
    return this.repository.find();
  }

  create(data: Partial<Tenant>) {
    const tenant = this.repository.create(data);
    return this.repository.save(tenant);
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }
}
