import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RecipientsService } from './recipients.service';

@ApiTags('Recipients')
@Controller('api/recipients')
export class RecipientsController {
  constructor(private readonly recipientsService: RecipientsService) { }

  @Get()
  findAll(
    @Query('recipientType') recipientType?: string,
    @Query('region') region?: string,
    @Query('category') category?: string,
    @Query('product') product?: string,
  ) {
    return this.recipientsService.findAll({
      recipientType,
      region,
      category,
      product,
    });
  }

  @Get('filter-options')
  getFilterOptions() {
    return this.recipientsService.getFilterOptions();
  }
}
