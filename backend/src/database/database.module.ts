import { Module, Scope, Global } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TenantsConnectionService } from './tenants-connection.service';
import { TenantsService } from '../tenants/tenants.service';

@Global()
@Module({
  providers: [
    TenantsConnectionService,
    {
      provide: 'TENANT_CONNECTION',
      scope: Scope.REQUEST,
      useFactory: async (
        tenantsConnectionService: TenantsConnectionService,
        tenantsService: TenantsService,
      ) => {
        const tenantId = tenantsService.getTenantId();
        if (tenantId === 'default') {
          return null; // Handle case where no tenant is selected
        }
        
        const tenant = await tenantsService.findOne(parseInt(tenantId));
        return tenantsConnectionService.getTenantConnection(tenantId, tenant?.dbName || '');
      },
      inject: [TenantsConnectionService, TenantsService],
    },
  ],
  exports: ['TENANT_CONNECTION', TenantsConnectionService],
})
export class DatabaseModule {}
