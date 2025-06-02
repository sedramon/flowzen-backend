import { Controller, Post, Body, Get, Param, Delete, Query, Put } from '@nestjs/common';
import { CreateServiceDto } from '../dto/CreateService.dto';
import { Service } from '../schemas/service.schema';
import { ServicesService } from '../service/services.service';
import { UpdateServiceDto } from '../dto/UpdateService.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    return this.servicesService.create(createServiceDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Service> {
    return this.servicesService.findOne(id);
  }

  @Get()
  async findAll(@Query('tenant') tenantId?: string): Promise<Service[]> {
    return this.servicesService.findAll(tenantId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.servicesService.delete(id);
    return { message: 'Service deleted successfully' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) : Promise<Service> {
    return this.servicesService.update(id, updateServiceDto);
  }
}
