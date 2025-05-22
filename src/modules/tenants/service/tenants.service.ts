import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateTenantDto } from "../dto/CreateTenant.dto";
import { UpdateTenantLicenseDto } from "../dto/UpdateTenantLicense.dto";
import { Tenant } from "../schemas/tenant.schema";

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

    async updateTenantLicense(id: string, updateTenantLicenseDto: UpdateTenantLicenseDto): Promise<Tenant>{
        const tenant = await this.tenantModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    hasActiveLicense: updateTenantLicenseDto.hasActiveLicense,
                    licenseStartDate: updateTenantLicenseDto.licenseStartDate,
                    licenseExpiryDate: updateTenantLicenseDto.licenseExpiryDate
                }
            },
            { new: true }          
        );

        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }

        return tenant;
    }
}