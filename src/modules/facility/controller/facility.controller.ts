import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FacilityService } from '../service/facility.service';
import { Facility } from '../schema/facility.schema';
import { CreateFacilityDto } from '../dto/CreateFacility.dto';

@Controller('facility')
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @Post()
  async create(@Body() createFacilityDto: any): Promise<Facility> {
    return await this.facilityService.create(createFacilityDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() createFacilityDto: CreateFacilityDto,
  ): Promise<Facility> {
    return await this.facilityService.update(id, createFacilityDto);
  }

  @Get()
  async findAll(@Query('tenant') tenantId?: string): Promise<Facility[]> {
    return await this.facilityService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Facility> {
    return await this.facilityService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.facilityService.delete(id);
  }
}
