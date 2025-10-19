import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Service } from '../schemas/service.schema';
import { CreateServiceDto } from '../dto/CreateService.dto';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { UpdateServiceDto } from '../dto/UpdateService.dto';

@Injectable()
export class ServicesService {
    constructor(
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
    ) {}

    async create(createServiceDto: CreateServiceDto): Promise<Service> {
        try {
            const { tenant, ...serviceDetails } = createServiceDto;

            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            // Check if tenant exists
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            const service = await this.serviceModel.create(createServiceDto);
            return service;
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: string): Promise<Service> {
        return this.serviceModel.findById(id).exec();
    }

    async findAll(tenantId: string): Promise<Service[]> {
        if (!isValidObjectId(tenantId)) {
            throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
        }
        return this.serviceModel.find({ tenant: tenantId }).exec();
    }

    async delete(id: string): Promise<void> {
        await this.serviceModel.findByIdAndDelete(id).exec();
    }

    async update(id: string, updateServiceDto: UpdateServiceDto) {
        try {
            const { tenant, ...serviceDetails } = updateServiceDto;

            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }
            if (!isValidObjectId(id)) {
                throw new BadRequestException(`Invalid service ID: ${id}`);
            }

            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            const updatedService = await this.serviceModel.findOneAndUpdate(
                { _id: id, tenant },
                { $set: serviceDetails },
                { new: true },
            ).exec();

            if (!updatedService) {
                throw new NotFoundException(`Service with ID ${id} not found for the specified tenant`);
            }

            return updatedService;

        } catch (error) {
            throw error;
        }
    }
}
