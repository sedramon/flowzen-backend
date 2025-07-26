import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { CreateClientDto } from '../dto/CreateClient.dto';
import { Client } from '../schemas/client.schema';
import { FilterClientsDto } from '../dto/filter-clients.dto';

@Injectable()
export class ClientsService {
    constructor(
        @InjectModel(Client.name) private clientModel: Model<Client>,
        @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    ) { }

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

    async findAll(qs: FilterClientsDto): Promise<{
        data: Client[];
        total: number;
        page: number;
        limit: number;
    }> {
        const {
            tenant,
            search,
            createdFrom,
            createdTo,
            sortBy,
            sortDir,
            page,
            limit,
        } = qs;
        const filter: any = {};

        if (!isValidObjectId(tenant)) {
            throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
        }

        if (search?.trim()) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { contactEmail: { $regex: search, $options: 'i' } },
            ];
        }

        if (createdFrom || createdTo) {
            filter.createdAt = {};

            if (createdFrom) {
                filter.createdAt.$gte = new Date(createdFrom);
            }

            if (createdTo) {
                filter.createdAt.$lte = new Date(createdTo);
            }
        }

        const skip = (page - 1) * limit;
        const sortObj: any = {};
        if (sortBy) {
            sortObj[sortBy] = sortDir === 'desc' ? -1 : 1;
        }
        const [data, total] = await Promise.all([
            this.clientModel
                .find(filter)
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .exec(),

            this.clientModel.countDocuments(filter).exec(),
        ]);

        return { data, total, page, limit };
    }

    async findAllData(tenantId: string): Promise<Client[]> {
        try {
            if (!isValidObjectId(tenantId)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
            }

            const tenantDocument = await this.tenantModel.findById(tenantId).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
            }

            return this.clientModel
                .find({ tenant: tenantId })
                .exec();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: string): Promise<Client> {
        return this.clientModel.findById(id).exec();
    }

    async delete(id: string): Promise<void> {
        await this.clientModel.findByIdAndDelete(id).exec();
    }

    async update(id: string, createClientDto: CreateClientDto): Promise<Client> {
        try {
            const { tenant, ...clientDetails } = createClientDto;
            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }
            return await this.clientModel
                .findByIdAndUpdate(id, createClientDto, { new: true })
                .exec();
        } catch (error) {
            throw new Error(error);
        }
    }
}
