import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('kpis')
  getKpis() {
    return this.analyticsService.getKpis();
  }

  @Get('chart')
  getChartData(@Query('period') period?: string) {
    return this.analyticsService.getChartData(period);
  }
}
