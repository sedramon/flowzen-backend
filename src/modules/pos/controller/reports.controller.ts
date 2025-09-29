import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth.guard';
import { ScopesGuard } from '../../auth/scopes.guard';
import { ReportsService } from '../service/reports.service';

@Controller('pos/reports')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  async daily(@Query('facility') facility: string, @Query('date') date: string, @Req() req) {
    return this.reportsService.dailyReport(facility, date, req.user);
  }

  @Get('session/:sessionId/z')
  async zReport(@Param('sessionId') sessionId: string, @Req() req) {
    return this.reportsService.zReport(sessionId, req.user);
  }
}
