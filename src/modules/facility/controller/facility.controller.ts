import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { FacilityService } from '../service/facility.service';
import { Facility } from '../schema/facility.schema';
import { CreateFacilityDto } from '../dto/CreateFacility.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ScopesGuard } from 'src/common/guards/scopes.guard';
import { Scopes } from 'src/common/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('facility')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class FacilityController {
    constructor(private readonly facilityService: FacilityService) {}

  @Scopes('scope_facilities:create')
  @Post()
    async create(@Body() createFacilityDto: CreateFacilityDto): Promise<Facility> {
        return await this.facilityService.create(createFacilityDto);
    }

  @Scopes('scope_facilities:update')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() createFacilityDto: CreateFacilityDto,
  ): Promise<Facility> {
      return await this.facilityService.update(id, createFacilityDto);
  }

  @Scopes('scope_facilities:read')
  @Get()
  async findAll(@Query('tenant') tenantId?: string): Promise<Facility[]> {
      return await this.facilityService.findAll(tenantId);
  }

  @Scopes('scope_facilities:read')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Facility> {
      return await this.facilityService.findOne(id);
  }

  @Scopes('scope_facilities:delete')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
      return await this.facilityService.delete(id);
  }
}
