import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { WorkingShiftService } from '../service/working-shift.service';
import { CreateWorkingShiftDto } from '../dto/create-working-shift.dto/create-working-shift.dto';
import { UpdateWorkingShiftDto } from '../dto/update-working-shift.dto/update-working-shift.dto';
import { JwtAuthGuard } from 'src/modules/auth/auth.guard';
import { ScopesGuard } from 'src/modules/auth/scopes.guard';
import { Scope } from 'src/modules/scopes/schemas/scope.schema';
import { Scopes } from 'src/modules/auth/scopes.decorator';

@Controller('working-shifts')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class WorkingShiftsController {
  constructor(private readonly service: WorkingShiftService) {}

  @Scopes('scope_working_shifts:create')
  @Post()
  create(@Body() dto: CreateWorkingShiftDto) {
    return this.service.create(dto);
  }

  @Scopes('scope_working_shifts:read')
  @Get()
  async findAll(
    @Query('employeeId') employeeId: string,
    @Query('tenantId') tenantId: string,
    @Query('month') month: string,
    @Query('year') year: string
  ) {
    return this.service.findForEmployeeMonth(
      employeeId,
      tenantId,
      parseInt(month, 10),
      parseInt(year, 10)
    );
  }

  @Scopes('scope_working_shifts:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Scopes('scope_working_shifts:update')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkingShiftDto) {
    return this.service.update(id, dto);
  }

  @Scopes('scope_working_shifts:delete')
  @Delete('by-employee-date')
  removeByEmployeeDate(
    @Query('employeeId') employeeId: string,
    @Query('date') date: string,
    @Query('tenantId') tenantId: string
  ) {
    return this.service.removeByEmployeeDate(employeeId, date, tenantId);
  }

  @Scopes('scope_working_shifts:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Scopes('scope_working_shifts:create')
  @Post('upsert')
  upsert(@Body() dto: CreateWorkingShiftDto) {
    return this.service.upsertShift(dto);
  }
}
