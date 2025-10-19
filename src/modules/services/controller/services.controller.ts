import { Controller, Post, Body, Get, Param, Delete, Query, Put, UseGuards } from '@nestjs/common';
import { CreateServiceDto } from '../dto/CreateService.dto';
import { Service } from '../schemas/service.schema';
import { ServicesService } from '../service/services.service';
import { UpdateServiceDto } from '../dto/UpdateService.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ScopesGuard } from 'src/common/guards/scopes.guard';
import { Scopes } from 'src/common/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('services')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) {}

  @Scopes('scope_services:create')
  @Post()
    async create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
        return this.servicesService.create(createServiceDto);
    }

  @Scopes('scope_services:read')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Service> {
      return this.servicesService.findOne(id);
  }

  @Scopes('scope_services:read')
  @Get()
  async findAll(@Query('tenant') tenantId?: string): Promise<Service[]> {
      return this.servicesService.findAll(tenantId);
  }

  @Scopes('scope_services:delete')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
      await this.servicesService.delete(id);
      return { message: 'Service deleted successfully' };
  }

  @Scopes('scope_services:update')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) : Promise<Service> {
      return this.servicesService.update(id, updateServiceDto);
  }
}
