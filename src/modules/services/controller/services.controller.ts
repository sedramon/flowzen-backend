import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateServiceDto } from '../dto/create-service.dto';
import { Service } from '../schemas/service.schema';
import { ServicesService } from '../service/services.service';

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
  async findAll(): Promise<Service[]> {
    return this.servicesService.findAll();
  }
}
