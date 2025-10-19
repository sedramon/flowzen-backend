import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { WorkingShiftService } from '../service/working-shift.service';
import { CreateWorkingShiftDto } from '../dto/create-working-shift.dto/create-working-shift.dto';
import { UpdateWorkingShiftDto } from '../dto/update-working-shift.dto/update-working-shift.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ScopesGuard } from 'src/common/guards/scopes.guard';
import { Scopes } from 'src/common/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('working-shifts')
@ApiBearerAuth('access-token')
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
    @Query('employee') employee: string,
    @Query('tenant') tenant: string,
    @Query('facility') facility: string,
    @Query('month') month: string,
    @Query('year') year: string
  ) {
      return this.service.findForEmployeeMonth(
          employee,
          tenant,
          facility,
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
    @Query('employee') employee: string,
    @Query('date') date: string,
    @Query('tenant') tenant: string,
    @Query('facility') facility: string
  ) {
      return this.service.removeByEmployeeDate(employee, date, tenant, facility);
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
