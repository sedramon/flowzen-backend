import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isValidObjectId, Model } from "mongoose";
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";
import { CreateClientDto } from "../dto/CreateClient.dto";
import { Client } from "../schemas/client.schema";


@Injectable()
export class ClientsService {
    constructor(@InjectModel(Client.name) private clientModel: Model<Client>, @InjectModel(Tenant.name) private tenantModel: Model<Tenant>) { }

    async create(createClientDto: CreateClientDto): Promise<Client> {
        try {
            const { tenant, ...clientDetails } = createClientDto;

            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            // Check if tenant exists
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            const client = await this.clientModel.create(createClientDto);

            return client;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findAll(tenantId: string): Promise<Client[]> {
        if(!isValidObjectId(tenantId)){
            throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
        }

        return this.clientModel.find({ tenant: tenantId }).exec();
    }

    async findOne(id: string): Promise<Client> {
        return this.clientModel.findById(id).exec();
    }

    async delete(id: string): Promise<void> {
        await this.clientModel.findByIdAndDelete(id).exec();
    }

    async update(id: string, createClientDto: CreateClientDto): Promise<Client> {
        try{
            const { tenant, ...clientDetails } = createClientDto;
            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }
            return await this.clientModel.findByIdAndUpdate(id, createClientDto, { new: true }).exec();
        }catch(error){
            throw new Error(error);
        }
    }
}