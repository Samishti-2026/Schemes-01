import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/filter-values')
  getFilterValues(@Query('table') table: string, @Query('column') column: string) {
    return this.appService.getFilterValues(table, column);
  }
}
