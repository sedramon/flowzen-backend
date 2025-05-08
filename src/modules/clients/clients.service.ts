import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Client } from "./schemas/client.schema";
import { isValidObjectId, Model } from "mongoose";
import { Tenant } from "../tenants/schemas/tenant.schema";
import { CreateClientDto } from "./dto/CreateClient.dto";

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

    async findAll(): Promise<Client[]> {
        return this.clientModel.find().exec();
    }
}