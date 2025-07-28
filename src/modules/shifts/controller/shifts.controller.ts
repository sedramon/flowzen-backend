import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';
import { ShiftService } from '../service/shifts.service';
import { JwtAuthGuard } from 'src/modules/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('shifts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class ShiftController {
  constructor(private readonly service: ShiftService) {}

  @Post()
  create(@Body() dto: CreateShiftDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('tenantId') tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
