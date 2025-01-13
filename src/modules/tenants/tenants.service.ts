import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Tenant } from "./schemas/tenant.schema";
import { Model } from "mongoose";
import { CreateTenantDto } from "./dto/CreateTenant.dto";

@Injectable()
export class TenantsService {
    constructor(
        @InjectModel(Tenant.name) private tenantModel: Model<Tenant>
    ) { }

    async create(createTenantDto: CreateTenantDto): Promise<CreateTenantDto> {
        try {
            const tenant = await this.tenantModel.create(createTenantDto);
            return tenant;
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Tenant with this MIB or PIB already exists');
            }

            throw error;
        }
    }

    async findAll(): Promise<Tenant[]> {
        return this.tenantModel.find().exec();
    }
}