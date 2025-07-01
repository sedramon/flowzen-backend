import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { WorkingShiftService } from '../service/working-shift.service';
import { CreateWorkingShiftDto } from '../dto/create-working-shift.dto/create-working-shift.dto';
import { UpdateWorkingShiftDto } from '../dto/update-working-shift.dto/update-working-shift.dto';

@Controller('working-shifts')
export class WorkingShiftsController {
  constructor(private readonly service: WorkingShiftService) {}

  @Post()
  create(@Body() dto: CreateWorkingShiftDto) {
    return this.service.create(dto);
  }

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkingShiftDto) {
    return this.service.update(id, dto);
  }

  @Delete('by-employee-date')
  removeByEmployeeDate(
    @Query('employeeId') employeeId: string,
    @Query('date') date: string,
    @Query('tenantId') tenantId: string
  ) {
    return this.service.removeByEmployeeDate(employeeId, date, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('upsert')
  upsert(@Body() dto: CreateWorkingShiftDto) {
    return this.service.upsertShift(dto);
  }
}
