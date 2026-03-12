import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('upcoming-schemes')
  getUpcomingSchemes() {
    return this.dashboardService.getUpcomingSchemes();
  }
}
