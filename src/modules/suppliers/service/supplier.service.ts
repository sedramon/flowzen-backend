import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Supplier } from "../schema/supplier.schema";
import { isValidObjectId, Model } from "mongoose";
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";
import { CreateSupplierDto } from "../dto/CreateSupplier.dto";
import { UpdateSupplierDto } from "../dto/UpdateSupplier.dto";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class SuppliersService implements OnModuleInit {
    constructor(
        @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
        @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
        private readonly logger: PinoLogger
    ) {
        this.logger.setContext(SuppliersService.name)
    }

    async onModuleInit() {
        await this.supplierModel.syncIndexes();
    }

    async findAll(tenantId: string): Promise<Supplier[]> {
        this.logger.debug({tenantId}, 'Finding all suppliers for tenant')
        if(!isValidObjectId(tenantId)){
            this.logger.warn({tenantId}, 'Invalid tenant ID supplied to findAll')
            throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
        }

        const suppliers = await this.supplierModel.find({tenant: tenantId}).exec();
        this.logger.info({count: suppliers.length}, 'Retrieved suppliers')
        return suppliers;
    }

    async delete(id: string): Promise<void> {
        await this.supplierModel.findByIdAndDelete(id).exec();
    }

    async findOne(id: string): Promise<Supplier> {
        return this.supplierModel.findById(id).exec();
    }s

    async create(createSupplierDto: CreateSupplierDto) : Promise<Supplier> {
        try {
            const { tenant, ...supplierDetails } = createSupplierDto;

            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            // Check if tenant exists
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }
            const supplier = await this.supplierModel.create(createSupplierDto);
            return supplier;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async update(id: string, updateSupplierDto: UpdateSupplierDto) : Promise<Supplier> {
        try {
            const { tenant, ...supplierDetails } = updateSupplierDto;
            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }
            // Check if tenant exists
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }
            return await this.supplierModel.findByIdAndUpdate(id, updateSupplierDto, { new: true }).exec();
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}