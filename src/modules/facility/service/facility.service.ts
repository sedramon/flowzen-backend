import { BadRequestException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Facility } from '../schema/facility.schema';
import { isValidObjectId, Model } from 'mongoose';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { CreateFacilityDto } from '../dto/CreateFacility.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@Injectable()
export class FacilityService {
    constructor(
    @InjectModel(Facility.name) private facilityModel: Model<Facility>,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    ) {}

    async create (createFacilityDto: CreateFacilityDto): Promise<Facility> {
        try{
            const { tenant, ...facilityDetails } = createFacilityDto;

            if(!isValidObjectId(tenant)){
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            // Check if tenant exists
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            const facility = await this.facilityModel.create(createFacilityDto);

            return facility;

        }catch(error){
            throw error;
        }
    }

    async update(id: string, createFacilityDto: CreateFacilityDto): Promise<Facility> {
        try{
            const { tenant, ...facilityDetails } = createFacilityDto;

            if(!isValidObjectId(tenant)){
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            // Check if tenant exists
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            return await this.facilityModel.findByIdAndUpdate(id, createFacilityDto, { new: true }).exec();
        }catch(error){
            throw error;
        }
    }

    async findAll(tenantId: string): Promise<Facility[]> {
        if(!isValidObjectId(tenantId)){
            throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
        }

        return this.facilityModel.find({ tenant: tenantId }).exec();
    }

    async findOne(id: string): Promise<Facility> {
        return this.facilityModel.findById(id).exec();
    }

    async delete(id: string): Promise<void> {
        await this.facilityModel.findByIdAndDelete(id).exec();
    }
}
